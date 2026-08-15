const CACHE_TTL_MS = 15 * 60 * 1000
// 30 requêtes/min, la limite documentée du palier gratuit GeckoTerminal. La file
// est strictement série, donc le Nième graphe attend N × cet intervalle : à 5 s,
// les 17 pools d'un filtre courant mettaient 85 s à afficher leurs vraies bougies.
const MIN_INTERVAL_MS = 2000
const RATE_LIMIT_COOLDOWN_MS = 60 * 1000

const ohlcvCache = new Map()
const inFlight = new Map()
const queue = []
let processing = false
let lastRequestAt = 0
let rateLimitedUntil = 0

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const cacheKey = (pairAddress) =>
  String(pairAddress || '')
    .trim()
    .toLowerCase()

const getCached = (key) => {
  const entry = ohlcvCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    ohlcvCache.delete(key)
    return null
  }
  return entry.prices
}

const setCached = (key, prices) => {
  if (!prices || prices.length === 0) return
  ohlcvCache.set(key, {
    prices,
    cachedAt: Date.now(),
  })
}

const waitForSlot = async () => {
  const now = Date.now()
  if (now < rateLimitedUntil) {
    await sleep(rateLimitedUntil - now)
  }

  const elapsed = Date.now() - lastRequestAt
  if (elapsed < MIN_INTERVAL_MS) {
    await sleep(MIN_INTERVAL_MS - elapsed)
  }
}

const parseOhlcvList = (list) => {
  if (!Array.isArray(list) || list.length === 0) return []

  const prices = list.map((candle) => Number(candle[4]))
  if (
    !prices.length ||
    !prices.every((price) => Number.isFinite(price) && price > 0)
  ) {
    return []
  }

  return prices.reverse()
}

const fetchOhlcv = async (pairAddress) => {
  await waitForSlot()
  lastRequestAt = Date.now()

  const response = await fetch(
    `/api/gecko/networks/solana/pools/${encodeURIComponent(pairAddress)}/ohlcv/hour?aggregate=1&limit=72&currency=usd`,
  )

  if (response.status === 429) {
    rateLimitedUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS
    const err = new Error('GeckoTerminal rate limited')
    err.status = 429
    throw err
  }

  if (response.status === 404) {
    return []
  }

  if (!response.ok) {
    const err = new Error(`GeckoTerminal HTTP ${response.status}`)
    err.status = response.status
    throw err
  }

  rateLimitedUntil = 0

  const data = await response.json()
  return parseOhlcvList(data?.data?.attributes?.ohlcv_list)
}

const processQueue = async () => {
  if (processing) return
  processing = true

  while (queue.length > 0) {
    const item = queue.shift()

    try {
      const prices = await fetchOhlcv(item.pairAddress)
      setCached(item.cacheKey, prices)
      item.resolve(prices)
    } catch (error) {
      const rateLimited = error?.status === 429
      // Fail fast on 429 so UI can show Dex fallback instead of hanging
      const maxAttempts = rateLimited ? 1 : 2

      if (item.attempts >= maxAttempts) {
        item.resolve([])
        continue
      }

      await sleep(rateLimited ? 0 : 1500)
      queue.push({
        ...item,
        attempts: item.attempts + 1,
      })
    }
  }

  processing = false
  if (queue.length > 0) {
    processQueue()
  }
}

export const isGeckoRateLimited = () => Date.now() < rateLimitedUntil

export const getGeckoOhlcvPrices = async (pairAddress) => {
  const address = String(pairAddress || '').trim()
  if (!address) return []

  const key = cacheKey(address)
  const cached = getCached(key)
  if (cached !== null) return cached

  // While Gecko is cooling down, skip the queue so charts can fallback immediately
  if (isGeckoRateLimited()) {
    return []
  }

  if (inFlight.has(key)) {
    return inFlight.get(key)
  }

  const promise = new Promise((resolve) => {
    queue.push({
      pairAddress: address,
      cacheKey: key,
      resolve,
      attempts: 0,
    })
    processQueue()
  }).finally(() => {
    inFlight.delete(key)
  })

  inFlight.set(key, promise)
  return promise
}

export const clearGeckoOhlcvCache = () => {
  ohlcvCache.clear()
  inFlight.clear()
  queue.length = 0
  processing = false
  lastRequestAt = 0
  rateLimitedUntil = 0
}
