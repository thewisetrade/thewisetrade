const CACHE_TTL_MS = 5 * 60 * 1000
const MIN_INTERVAL_MS = 500

const pairsCache = new Map()
const pairByAddressCache = new Map()
const inFlight = new Map()
const queue = []
let processing = false
let lastRequestAt = 0
let flushTimer = null

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const normalizeAddress = (address) => String(address || '').trim()

const cacheKey = (address) => normalizeAddress(address).toLowerCase()

const getCachedPairs = (address) => {
  const key = cacheKey(address)
  const entry = pairsCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    pairsCache.delete(key)
    return null
  }
  return entry.pairs
}

const setCachedPairs = (address, pairs) => {
  // Never cache empty: DexScreener can truncate multi-token responses
  if (!pairs || pairs.length === 0) return
  pairsCache.set(cacheKey(address), {
    pairs,
    cachedAt: Date.now(),
  })
}

const getCachedPairByAddress = (pairAddress) => {
  const key = cacheKey(pairAddress)
  const entry = pairByAddressCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    pairByAddressCache.delete(key)
    return null
  }
  return entry.pair
}

const setCachedPairByAddress = (pairAddress, pair) => {
  if (!pair) return
  pairByAddressCache.set(cacheKey(pairAddress), {
    pair,
    cachedAt: Date.now(),
  })
}

const waitForSlot = async () => {
  const elapsed = Date.now() - lastRequestAt
  if (elapsed < MIN_INTERVAL_MS) {
    await sleep(MIN_INTERVAL_MS - elapsed)
  }
}

const fetchJson = async (url) => {
  await waitForSlot()
  lastRequestAt = Date.now()

  const response = await fetch(url)

  if (response.status === 429) {
    const retryAfterHeader = response.headers.get('retry-after')
    const retryAfterMs = retryAfterHeader
      ? Number(retryAfterHeader) * 1000
      : 5000
    await sleep(Number.isFinite(retryAfterMs) ? retryAfterMs : 5000)
    throw new Error('DexScreener rate limited')
  }

  if (!response.ok) {
    throw new Error(`DexScreener HTTP ${response.status}`)
  }

  return response.json()
}

const fetchTokenPairs = async (address) => {
  // One token per request: multi-address responses are capped around ~30 pairs total
  const data = await fetchJson(
    `https://api.dexscreener.com/latest/dex/tokens/${address}`,
  )
  return Array.isArray(data?.pairs) ? data.pairs : []
}

const fetchPairByAddress = async (pairAddress, chainId = 'solana') => {
  const data = await fetchJson(
    `https://api.dexscreener.com/latest/dex/pairs/${chainId}/${pairAddress}`,
  )
  const pairs = Array.isArray(data?.pairs) ? data.pairs : []
  return pairs[0] || null
}

const processQueue = async () => {
  if (processing) return
  processing = true

  while (queue.length > 0) {
    const item = queue.shift()

    try {
      if (item.type === 'pair') {
        const pair = await fetchPairByAddress(item.address, item.chainId)
        setCachedPairByAddress(item.address, pair)
        item.resolve(pair)
      } else {
        const pairs = await fetchTokenPairs(item.address)
        setCachedPairs(item.address, pairs)
        item.resolve(pairs)
      }
    } catch (error) {
      if (item.attempts >= 3) {
        item.reject(error)
        continue
      }
      await sleep(1500)
      queue.push({
        ...item,
        attempts: item.attempts + 1,
      })
    }
  }

  processing = false
  if (queue.length > 0) {
    scheduleProcess()
  }
}

const scheduleProcess = () => {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    processQueue()
  }, 40)
}

const enqueue = (item) =>
  new Promise((resolve, reject) => {
    queue.push({
      ...item,
      resolve,
      reject,
      attempts: 0,
    })
    scheduleProcess()
  })

export const getDexScreenerPairs = async (tokenAddress) => {
  const address = normalizeAddress(tokenAddress)
  if (!address) return []

  const cached = getCachedPairs(address)
  if (cached !== null) return cached

  const key = `token:${cacheKey(address)}`
  if (inFlight.has(key)) {
    return inFlight.get(key)
  }

  const promise = enqueue({ type: 'token', address })
    .then((pairs) => {
      setCachedPairs(address, pairs)
      return pairs
    })
    .finally(() => {
      inFlight.delete(key)
    })

  inFlight.set(key, promise)
  return promise
}

export const getDexScreenerPairByAddress = async (
  pairAddress,
  { chainId = 'solana' } = {},
) => {
  const address = normalizeAddress(pairAddress)
  if (!address) return null

  const cached = getCachedPairByAddress(address)
  if (cached !== null) return cached

  const key = `pair:${cacheKey(address)}`
  if (inFlight.has(key)) {
    return inFlight.get(key)
  }

  const promise = enqueue({ type: 'pair', address, chainId })
    .then((pair) => {
      setCachedPairByAddress(address, pair)
      return pair
    })
    .finally(() => {
      inFlight.delete(key)
    })

  inFlight.set(key, promise)
  return promise
}

const CHART_QUOTE_PRIORITY = new Map([
  ['So11111111111111111111111111111111111111112', 0], // SOL
  ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 1], // USDC
  ['Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', 2], // USDT
])

const pairLiquidity = (pair) => pair?.liquidity?.usd || 0

const pairVolume24h = (pair) => pair?.volume?.h24 || 0

const quotePriority = (pair) => {
  const quote = pair?.quoteToken?.address
  if (quote && CHART_QUOTE_PRIORITY.has(quote)) {
    return CHART_QUOTE_PRIORITY.get(quote)
  }
  const base = pair?.baseToken?.address
  if (base && CHART_QUOTE_PRIORITY.has(base)) {
    return CHART_QUOTE_PRIORITY.get(base)
  }
  return 50
}

const comparePairsForChart = (a, b) => {
  const quoteDiff = quotePriority(a) - quotePriority(b)
  if (quoteDiff !== 0) return quoteDiff

  const liqDiff = pairLiquidity(b) - pairLiquidity(a)
  if (liqDiff !== 0) return liqDiff

  return pairVolume24h(b) - pairVolume24h(a)
}

export const rankDexScreenerPairsForChart = (
  pairs,
  { chainId = 'solana' } = {},
) => {
  if (!Array.isArray(pairs) || pairs.length === 0) return []

  const preferred = pairs.filter((pair) => pair.chainId === chainId)
  const candidates = preferred.length > 0 ? preferred : pairs

  return [...candidates].sort(comparePairsForChart)
}

export const getBestDexScreenerPair = async (
  tokenAddress,
  { chainId = 'solana' } = {},
) => {
  const pairs = await getDexScreenerPairs(tokenAddress)
  const ranked = rankDexScreenerPairsForChart(pairs, { chainId })
  return ranked[0] || null
}

export const getChartDexScreenerPairs = async (
  tokenAddress,
  { chainId = 'solana', limit = 5, preferredPairAddress = null } = {},
) => {
  const preferredAddress = normalizeAddress(preferredPairAddress)
  const pairs = []

  if (preferredAddress) {
    try {
      const preferredPair = await getDexScreenerPairByAddress(
        preferredAddress,
        {
          chainId,
        },
      )
      if (preferredPair) {
        pairs.push(preferredPair)
      } else {
        // Dex may not index the pool yet; still try OHLCV with this address
        pairs.push({ pairAddress: preferredAddress, chainId })
      }
    } catch {
      pairs.push({ pairAddress: preferredAddress, chainId })
    }
  }

  if (tokenAddress && pairs.length < limit) {
    try {
      const tokenPairs = await getDexScreenerPairs(tokenAddress)
      const ranked = rankDexScreenerPairsForChart(tokenPairs, { chainId })
      for (const pair of ranked) {
        if (
          preferredAddress &&
          cacheKey(pair.pairAddress) === cacheKey(preferredAddress)
        ) {
          continue
        }
        pairs.push(pair)
        if (pairs.length >= limit) break
      }
    } catch {
      // Preferred pool is enough to render a chart
    }
  }

  return pairs.slice(0, limit)
}

export const clearDexScreenerCache = () => {
  pairsCache.clear()
  pairByAddressCache.clear()
  inFlight.clear()
  queue.length = 0
  processing = false
  lastRequestAt = 0
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
}
