import {
  upsertPools,
  getStoredPools,
  countStoredPools,
  setPoolPositions,
  getAllPoolPositionsMap,
  isPoolPositionsCacheFresh,
} from '@/utils/portfolio-history-db'

const METEORA_UPSTREAM = 'https://dlmm.datapi.meteora.ag'
const METEORA_PROXY_PREFIX = '/api/meteora'
const MAX_DAYS_BACK = 365
const PAGE_SIZE = 50
const PORTFOLIO_POOL_CAP = 500
const REQUEST_GAP_MS = 45
const FETCH_RETRIES = 2

let lastRequestAt = 0
const queue = []
let draining = false

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const drainQueue = async () => {
  if (draining) return
  draining = true
  try {
    while (queue.length > 0) {
      const job = queue.shift()
      const wait = REQUEST_GAP_MS - (Date.now() - lastRequestAt)
      if (wait > 0) await sleep(wait)
      lastRequestAt = Date.now()
      try {
        const result = await job.run()
        job.resolve(result)
      } catch (error) {
        job.reject(error)
      }
    }
  } finally {
    draining = false
    if (queue.length > 0) {
      drainQueue()
    }
  }
}

const enqueue = (run) =>
  new Promise((resolve, reject) => {
    queue.push({ run, resolve, reject })
    drainQueue()
  })

const toNumber = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const toBlockTimeSeconds = (value) => {
  const n = toNumber(value)
  if (!n) return 0
  return n > 1e12 ? Math.floor(n / 1000) : Math.floor(n)
}

const getMeteoraBase = () => {
  // Same-origin proxy avoids browser CORS / NetworkError on datapi.meteora.ag
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${METEORA_PROXY_PREFIX}`
  }
  return METEORA_UPSTREAM
}

const buildUrl = (path, params = {}) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const base = getMeteoraBase()
  const url = new URL(
    normalizedPath.replace(/^\//, ''),
    base.endsWith('/') ? base : `${base}/`,
  )
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    url.searchParams.set(key, String(value))
  })
  return url.toString()
}

const isRetryableFetchError = (error) => {
  const message = String(error?.message || error || '')
  return (
    error instanceof TypeError ||
    /NetworkError|Failed to fetch|network|Load failed/i.test(message)
  )
}

const meteoraFetch = async (path, params = {}) =>
  enqueue(async () => {
    let lastError
    for (let attempt = 0; attempt <= FETCH_RETRIES; attempt++) {
      try {
        const response = await fetch(buildUrl(path, params))
        if (!response.ok) {
          const text = await response.text()
          throw new Error(
            `Meteora API ${response.status}: ${text || response.statusText}`,
          )
        }
        return await response.json()
      } catch (error) {
        lastError = error
        if (!isRetryableFetchError(error) || attempt === FETCH_RETRIES) {
          throw error
        }
        await sleep(250 * (attempt + 1))
      }
    }
    throw lastError
  })

const daysBackFromPeriod = (timePeriod) => {
  if (!timePeriod?.start || !timePeriod?.end) return MAX_DAYS_BACK
  if (typeof timePeriod.end.diff !== 'function') return MAX_DAYS_BACK
  try {
    const days = Math.ceil(timePeriod.end.diff(timePeriod.start, 'days').days)
    if (!Number.isFinite(days) || days <= 0) return MAX_DAYS_BACK
    return Math.min(MAX_DAYS_BACK, Math.max(1, days))
  } catch {
    return MAX_DAYS_BACK
  }
}

const isSolMint = (mint) =>
  mint === 'So11111111111111111111111111111111111111112'

const isUsdcMint = (mint) =>
  mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

const isEurcMint = (mint) =>
  mint === 'HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr'

const quoteSymbolFromMint = (mint, fallbackSymbol) => {
  if (isSolMint(mint)) return 'SOL'
  if (isUsdcMint(mint)) return 'USDC'
  if (isEurcMint(mint)) return 'EURC'
  if (fallbackSymbol === 'USDC' || fallbackSymbol === 'EURC') return fallbackSymbol
  return fallbackSymbol || 'UNKNOWN'
}

const pickQuoteAmount = (usdValue, solValue, quoteToken) =>
  quoteToken === 'SOL' ? toNumber(solValue) : toNumber(usdValue)

const mapPoolToPosition = (pool, quoteToken) => {
  const quoteSymbol = quoteSymbolFromMint(pool.tokenYMint, pool.tokenY)
  return {
    position_address: pool.poolAddress,
    pool_address: pool.poolAddress,
    signature: pool.poolAddress,
    base_symbol: pool.tokenX,
    quote_symbol: quoteSymbol,
    token_x_mint: pool.tokenXMint,
    token_y_mint: pool.tokenYMint,
    token_x_icon: pool.tokenXIcon,
    token_y_icon: pool.tokenYIcon,
    deposit: pickQuoteAmount(pool.totalDeposit, pool.totalDepositSol, quoteToken),
    withdrawal: pickQuoteAmount(
      pool.totalWithdrawal,
      pool.totalWithdrawalSol,
      quoteToken,
    ),
    fee_amount: pickQuoteAmount(pool.totalFee, pool.totalFeeSol, quoteToken),
    profit: pickQuoteAmount(pool.pnlUsd, pool.pnlSol, quoteToken),
    block_time: toBlockTimeSeconds(pool.lastClosedAt),
    position_is_open: false,
    transactions: [],
    events_loaded: false,
    is_pool_group: true,
  }
}

const mapPnlPosition = (position, pool, quoteToken) => {
  const quoteSymbol = quoteSymbolFromMint(
    pool?.tokenYMint || position.tokenY,
    pool?.tokenY,
  )
  const deposits = position.allTimeDeposits || {}
  const withdrawals = position.allTimeWithdrawals || {}
  const fees = position.allTimeFees || {}

  return {
    position_address: position.positionAddress,
    pool_address: pool?.poolAddress || position.poolAddress,
    signature: position.positionAddress,
    base_symbol: pool?.tokenX || 'TOKEN',
    quote_symbol: quoteSymbol,
    token_x_mint: pool?.tokenXMint || position.tokenX,
    token_y_mint: pool?.tokenYMint || position.tokenY,
    deposit: pickQuoteAmount(deposits.total?.usd, deposits.total?.sol, quoteToken),
    withdrawal: pickQuoteAmount(
      withdrawals.total?.usd,
      withdrawals.total?.sol,
      quoteToken,
    ),
    fee_amount: pickQuoteAmount(fees.total?.usd, fees.total?.sol, quoteToken),
    profit: pickQuoteAmount(position.pnlUsd, position.pnlSol, quoteToken),
    block_time: toBlockTimeSeconds(position.closedAt || position.updatedAt || position.createdAt),
    position_is_open: !position.isClosed,
    transactions: [],
    events_loaded: false,
    is_pool_group: false,
  }
}

const mapHistoricalEvent = (event, quoteToken) => {
  const blockTime = toBlockTimeSeconds(event.blockTime)
  const usd = toNumber(event.totalUsd)
  const solAmount = isSolMint(event.tokenY)
    ? toNumber(event.amountY)
    : isSolMint(event.tokenX)
      ? toNumber(event.amountX)
      : 0
  const amount = quoteToken === 'SOL' ? solAmount : usd

  const row = {
    signature: event.signature,
    block_time: blockTime,
    event_type: event.eventType,
    deposit: 0,
    withdrawal: 0,
    fee_amount: 0,
  }

  if (event.eventType === 'add') row.deposit = amount
  else if (event.eventType === 'remove') row.withdrawal = amount
  else if (event.eventType === 'claim_fee' || event.eventType === 'claim_reward') {
    row.fee_amount = amount
  }

  return row
}

const fetchPortfolioTotal = (user) =>
  meteoraFetch('/portfolio/total', { user })

const fetchPortfolioPage = (user, { page = 1, pageSize = PAGE_SIZE, daysBack = MAX_DAYS_BACK } = {}) =>
  meteoraFetch('/portfolio', {
    user,
    page,
    page_size: pageSize,
    days_back: daysBack,
  })

const fetchAllPortfolioPools = async (user, { daysBack = MAX_DAYS_BACK, onProgress } = {}) => {
  const pools = []
  let page = 1
  let hasNext = true
  let totalCount = 0
  let totalPositions = 0

  while (hasNext) {
    const data = await fetchPortfolioPage(user, { page, daysBack })
    const batch = data.pools || []
    pools.push(...batch)
    totalCount = data.totalCount || totalCount
    totalPositions = data.totalPositions || totalPositions

    const reachedEnd =
      !data.hasNext ||
      batch.length === 0 ||
      (data.totalCount && pools.length >= data.totalCount)

    hasNext = !reachedEnd
    if (onProgress) {
      onProgress({
        stage: 'pools',
        page,
        loaded: pools.length,
        totalCount: data.totalCount,
        totalPositions: data.totalPositions,
      })
    }
    page += 1
    if (page > 30) break
  }

  return {
    pools,
    totalCount,
    totalPositions,
    capped: totalCount >= PORTFOLIO_POOL_CAP - 5,
  }
}

const fetchPoolPositionPnLPage = (
  poolAddress,
  user,
  { page = 1, pageSize = 100, status = 'closed' } = {},
) =>
  meteoraFetch(`/positions/${poolAddress}/pnl`, {
    user,
    page,
    page_size: pageSize,
    status,
  })

const fetchAllPoolPositions = async (
  poolAddress,
  user,
  { status = 'closed' } = {},
) => {
  const positions = []
  let page = 1
  let hasNext = true
  let poolMeta = null

  while (hasNext) {
    const data = await fetchPoolPositionPnLPage(poolAddress, user, {
      page,
      status,
    })
    if (!poolMeta) {
      poolMeta = {
        poolAddress,
        tokenX: data.tokenX,
        tokenY: data.tokenY,
        tokenXMint: data.tokenX,
        tokenYMint: data.tokenY,
      }
    }
    const batch = data.positions || []
    positions.push(...batch)

    const reachedEnd =
      !data.hasNext ||
      batch.length === 0 ||
      (data.totalCount && positions.length >= data.totalCount)

    hasNext = !reachedEnd
    page += 1
    if (page > 50) break
  }

  return {
    positions,
    poolMeta,
    raw: { tokenX: poolMeta?.tokenX, tokenY: poolMeta?.tokenY },
  }
}

const fetchPositionHistorical = (positionAddress, { orderDirection = 'asc' } = {}) =>
  meteoraFetch(`/positions/${positionAddress}/historical`, {
    order_direction: orderDirection,
  })

const mapWithConcurrency = async (items, concurrency, worker) => {
  if (!items.length) return []
  const results = new Array(items.length)
  let index = 0

  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (index < items.length) {
        const current = index
        index += 1
        results[current] = await worker(items[current], current)
      }
    },
  )

  await Promise.all(runners)
  return results
}

const mergePoolsByAddress = (apiPools, storedPools) => {
  const byAddress = new Map()
  storedPools.forEach((pool) => {
    if (pool?.poolAddress) byAddress.set(pool.poolAddress, pool)
  })
  // Fresh API data overrides local for overlapping pools
  apiPools.forEach((pool) => {
    if (pool?.poolAddress) byAddress.set(pool.poolAddress, pool)
  })
  return [...byAddress.values()].sort(
    (a, b) => (b.lastClosedAt || 0) - (a.lastClosedAt || 0),
  )
}

const filterPoolsForQuote = (pools, quoteToken) =>
  (pools || []).filter(
    (pool) =>
      pool?.poolAddress &&
      quoteSymbolFromMint(pool.tokenYMint, pool.tokenY) === quoteToken,
  )

const filterPositionsForPeriod = (positions, timePeriod) => {
  if (!timePeriod?.start || !timePeriod?.end || timePeriod.name === 'All') {
    return positions || []
  }
  if (typeof timePeriod.start.toJSDate !== 'function') return positions || []

  const start = timePeriod.start.toJSDate()
  const end = timePeriod.end.toJSDate()
  return (positions || []).filter((position) => {
    if (!position.block_time) return true
    const positionDate = new Date(position.block_time * 1000)
    return positionDate >= start && positionDate <= end
  })
}

const loadCachedClosedPortfolio = async (
  user,
  quoteToken,
  timePeriod,
  groupBy = 'pair',
) => {
  if (!user || typeof window === 'undefined') {
    return { positions: [], poolCount: 0, positionCount: 0 }
  }

  try {
    const stored = await getStoredPools(user)
    const quotePools = filterPoolsForQuote(stored, quoteToken)

    if (groupBy === 'pair') {
      const positions = filterPositionsForPeriod(
        quotePools.map((pool) => mapPoolToPosition(pool, quoteToken)),
        timePeriod,
      )
      return {
        positions,
        poolCount: quotePools.length,
        positionCount: positions.length,
        fromCache: true,
      }
    }

    const cacheByPool = await getAllPoolPositionsMap(user, quoteToken)
    const positions = []
    quotePools.forEach((pool) => {
      const cached = cacheByPool.get(pool.poolAddress)
      if (isPoolPositionsCacheFresh(pool, cached)) {
        positions.push(...(cached.positions || []))
      }
    })

    return {
      positions: filterPositionsForPeriod(positions, timePeriod),
      poolCount: quotePools.length,
      positionCount: positions.length,
      fromCache: true,
    }
  } catch (error) {
    console.warn('Local closed portfolio unavailable:', error)
    return { positions: [], poolCount: 0, positionCount: 0, fromCache: true }
  }
}

const syncPortfolioPools = async (user, { daysBack = MAX_DAYS_BACK, onProgress, storedPools = null } = {}) => {
  let stored = storedPools
  if (!stored) {
    try {
      stored = await getStoredPools(user)
    } catch {
      stored = []
    }
  }

  const apiResult = await fetchAllPortfolioPools(user, { daysBack, onProgress })
  let merged = apiResult.pools
  let localCount = apiResult.pools.length

  try {
    if (apiResult.pools.length) {
      await upsertPools(user, apiResult.pools)
    }

    merged = mergePoolsByAddress(apiResult.pools, stored)
    localCount = Math.max(await countStoredPools(user), merged.length)
  } catch (error) {
    console.warn('Local portfolio history unavailable, using API only:', error)
    merged = stored.length ? mergePoolsByAddress(apiResult.pools, stored) : apiResult.pools
    localCount = merged.length
  }

  if (!merged.length && apiResult.pools.length) {
    merged = apiResult.pools
  }

  return {
    pools: merged,
    totalCount: apiResult.totalCount,
    totalPositions: apiResult.totalPositions,
    capped: apiResult.capped || localCount > apiResult.pools.length,
    apiPoolCount: apiResult.pools.length,
    localPoolCount: localCount,
    staleRefreshed: 0,
  }
}

const loadPortfolioAsPairs = async (user, quoteToken, timePeriod, onProgress) => {
  const daysBack = daysBackFromPeriod(timePeriod)
  const result = await syncPortfolioPools(user, { daysBack, onProgress })
  const allMapped = (result.pools || [])
    .filter((pool) => pool?.poolAddress)
    .map((pool) => mapPoolToPosition(pool, quoteToken))
  const positions = allMapped.filter(
    (position) => position.quote_symbol === quoteToken,
  )
  return {
    positions,
    allMappedCount: allMapped.length,
    capped: result.capped,
    totalCount: result.totalCount,
    totalPositions: result.totalPositions,
    apiPoolCount: result.apiPoolCount,
    localPoolCount: result.localPoolCount,
  }
}

const loadPortfolioAsPositions = async (user, quoteToken, timePeriod, onProgress) => {
  const daysBack = daysBackFromPeriod(timePeriod)

  let storedPools = []
  let cacheByPool = new Map()
  try {
    storedPools = await getStoredPools(user)
    cacheByPool = await getAllPoolPositionsMap(user, quoteToken)
  } catch {
    storedPools = []
    cacheByPool = new Map()
  }

  const result = await syncPortfolioPools(user, {
    daysBack,
    onProgress,
    storedPools,
  })

  const quotePools = filterPoolsForQuote(result.pools, quoteToken)

  let completed = 0
  let positionsLoaded = 0
  let cacheHits = 0
  const nested = await mapWithConcurrency(quotePools, 6, async (pool) => {
    let mapped = null
    const cached = cacheByPool.get(pool.poolAddress)

    if (isPoolPositionsCacheFresh(pool, cached)) {
      mapped = cached.positions
    }

    if (!Array.isArray(mapped)) {
      const { positions } = await fetchAllPoolPositions(pool.poolAddress, user, {
        status: 'closed',
      })
      mapped = positions.map((position) =>
        mapPnlPosition(position, pool, quoteToken),
      )
      try {
        await setPoolPositions(
          user,
          pool.poolAddress,
          quoteToken,
          mapped,
          pool.lastClosedAt || 0,
        )
        cacheByPool.set(pool.poolAddress, {
          positions: mapped,
          poolLastClosedAt: pool.lastClosedAt || 0,
        })
      } catch (error) {
        console.warn('Failed to cache pool positions', pool.poolAddress, error)
      }
    } else {
      cacheHits += 1
    }

    completed += 1
    positionsLoaded += mapped.length
    if (onProgress) {
      onProgress({
        stage: 'positions',
        loaded: completed,
        totalCount: quotePools.length,
        positionsLoaded,
        cacheHits,
      })
    }
    return mapped
  })

  return {
    positions: nested.flat(),
    allMappedCount: quotePools.length,
    capped: result.capped,
    totalCount: result.totalCount,
    totalPositions: result.totalPositions,
    apiPoolCount: result.apiPoolCount,
    localPoolCount: result.localPoolCount,
    cacheHits,
  }
}

const fetchOpenPortfolioPage = (
  user,
  { page = 1, pageSize = 50, sortBy = 'current_balances', sortDirection = 'desc' } = {},
) =>
  meteoraFetch('/portfolio/open', {
    user,
    page,
    page_size: pageSize,
    sort_by: sortBy,
    sort_direction: sortDirection,
  })

const fetchAllOpenPortfolioPools = async (user, { onProgress } = {}) => {
  const pools = []
  let page = 1
  let hasNext = true
  let totalCount = 0
  let totalPositions = 0
  let total = null

  while (hasNext) {
    const data = await fetchOpenPortfolioPage(user, { page })
    const batch = data.pools || []
    pools.push(...batch)
    totalCount = data.totalCount || totalCount
    totalPositions = data.totalPositions || totalPositions
    if (data.total) total = data.total

    const reachedEnd =
      !data.hasNext ||
      batch.length === 0 ||
      (data.totalCount && pools.length >= data.totalCount)

    hasNext = !reachedEnd
    if (onProgress) {
      onProgress({
        stage: 'pools',
        loaded: pools.length,
        totalCount: data.totalCount,
        totalPositions: data.totalPositions,
      })
    }
    page += 1
    if (page > 30) break
  }

  return { pools, totalCount, totalPositions, total }
}

const mapOpenPnlToUi = (position, pool) => {
  const unrealized = position.unrealizedPnl || {}
  const feeX = toNumber(unrealized.unclaimedFeeTokenX?.usd)
  const feeY = toNumber(unrealized.unclaimedFeeTokenY?.usd)
  const rewardX = toNumber(unrealized.unclaimedRewardTokenX?.usd)
  const rewardY = toNumber(unrealized.unclaimedRewardTokenY?.usd)
  const unclaimedFeeUsd = feeX + feeY + rewardX + rewardY
  const valueUsd = toNumber(unrealized.balances)

  const feeXSol = toNumber(unrealized.unclaimedFeeTokenX?.amountSol)
  const feeYSol = toNumber(unrealized.unclaimedFeeTokenY?.amountSol)
  const rewardXSol = toNumber(unrealized.unclaimedRewardTokenX?.amountSol)
  const rewardYSol = toNumber(unrealized.unclaimedRewardTokenY?.amountSol)
  const unclaimedFeeSol = feeXSol + feeYSol + rewardXSol + rewardYSol
  const valueSol = toNumber(unrealized.balancesSol)

  return {
    id: position.positionAddress,
    poolAddress: pool.poolAddress,
    positionAddress: position.positionAddress,
    tokenX: pool.tokenX,
    tokenY: pool.tokenY,
    tokenXIcon: pool.tokenXIcon,
    tokenYIcon: pool.tokenYIcon,
    tokenXMint: pool.tokenXMint,
    tokenYMint: pool.tokenYMint,
    valueUsd,
    valueSol,
    unclaimedFeeUsd,
    unclaimedFeeSol,
    pnlUsd: toNumber(position.pnlUsd),
    pnlSol: toNumber(position.pnlSol),
    pnlPctChange: toNumber(position.pnlPctChange),
    isOutOfRange: !!position.isOutOfRange,
    outOfRangeSide: position.isOutOfRange
      ? toNumber(position.poolActivePrice) < toNumber(position.minPrice)
        ? 'lower'
        : 'upper'
      : null,
    minPrice: toNumber(position.minPrice),
    maxPrice: toNumber(position.maxPrice),
    poolActivePrice: toNumber(position.poolActivePrice || pool.poolPrice),
    lowerBinId: position.lowerBinId,
    upperBinId: position.upperBinId,
    createdAt: position.createdAt,
    binData: null,
    enriched: false,
  }
}

// Coarse rows from /portfolio/open when per-pool PnL fetch fails
const mapOpenPoolFallback = (pool) => {
  const addresses = pool.listPositions || []
  if (!addresses.length) return []
  const outOfRange = new Set(pool.positionsOutOfRange || [])
  const share = Math.max(addresses.length, 1)
  const valueUsd = toNumber(pool.balances) / share
  const unclaimedFeeUsd = toNumber(pool.unclaimedFees) / share
  const valueSol = toNumber(pool.balancesSol) / share
  const unclaimedFeeSol = toNumber(pool.unclaimedFeesSol) / share
  const poolActivePrice = toNumber(pool.poolPrice)

  return addresses.map((positionAddress) => ({
    id: positionAddress,
    poolAddress: pool.poolAddress,
    positionAddress,
    tokenX: pool.tokenX,
    tokenY: pool.tokenY,
    tokenXIcon: pool.tokenXIcon,
    tokenYIcon: pool.tokenYIcon,
    tokenXMint: pool.tokenXMint,
    tokenYMint: pool.tokenYMint,
    valueUsd,
    valueSol,
    unclaimedFeeUsd,
    unclaimedFeeSol,
    pnlUsd: 0,
    pnlSol: 0,
    pnlPctChange: 0,
    isOutOfRange: outOfRange.has(positionAddress) || !!pool.outOfRange,
    outOfRangeSide: outOfRange.has(positionAddress) ? 'upper' : null,
    minPrice: 0,
    maxPrice: 0,
    poolActivePrice,
    lowerBinId: null,
    upperBinId: null,
    createdAt: pool.updatedAt,
    binData: null,
    enriched: false,
  }))
}

const loadOpenPositions = async (user, onProgress) => {
  const { pools, totalCount, totalPositions, total } =
    await fetchAllOpenPortfolioPools(user, { onProgress })

  let completed = 0
  const nested = await mapWithConcurrency(pools, 4, async (pool) => {
    let mapped = []
    try {
      const { positions } = await fetchAllPoolPositions(pool.poolAddress, user, {
        status: 'open',
      })
      mapped = positions
        .filter((position) => !position.isClosed)
        .map((position) => mapOpenPnlToUi(position, pool))
    } catch (error) {
      console.warn(
        'Open PnL fetch failed, using portfolio/open fallback for',
        pool.poolAddress,
        error,
      )
      mapped = mapOpenPoolFallback(pool)
    }
    completed += 1
    if (onProgress) {
      onProgress({
        stage: 'positions',
        loaded: completed,
        totalCount: pools.length,
        positionsLoaded: mapped.length,
      })
    }
    return mapped
  })

  return {
    positions: nested.flat(),
    totalCount,
    totalPositions,
    total,
  }
}

const loadPositionEvents = async (positionAddress, quoteToken) => {
  const data = await fetchPositionHistorical(positionAddress)
  return (data.events || []).map((event) => mapHistoricalEvent(event, quoteToken))
}

const applySortBy = (sortBy, positions) =>
  [...positions].sort((a, b) =>
    sortBy === 'profit' ? b.profit - a.profit : b.block_time - a.block_time,
  )

const applySortOrder = (sortOrder, positions) =>
  sortOrder === 'desc' ? [...positions].reverse() : positions

const applyTimePeriod = (timePeriod, positions) => {
  if (!timePeriod?.start || !timePeriod?.end || typeof timePeriod.start.toJSDate !== 'function') {
    return positions
  }
  if (timePeriod.name === 'All') return positions

  const start = timePeriod.start.toJSDate()
  const end = timePeriod.end.toJSDate()
  return positions.filter((position) => {
    if (!position.block_time) return true
    const positionDate = new Date(position.block_time * 1000)
    return positionDate >= start && positionDate <= end
  })
}

const getDateFromBlockTime = (blockTime) => {
  const date = new Date(toBlockTimeSeconds(blockTime) * 1000)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export {
  MAX_DAYS_BACK,
  PORTFOLIO_POOL_CAP,
  daysBackFromPeriod,
  fetchPortfolioTotal,
  fetchAllPortfolioPools,
  fetchAllOpenPortfolioPools,
  fetchAllPoolPositions,
  fetchPositionHistorical,
  loadCachedClosedPortfolio,
  loadPortfolioAsPairs,
  loadPortfolioAsPositions,
  loadOpenPositions,
  loadPositionEvents,
  mapPoolToPosition,
  mapPnlPosition,
  applySortBy,
  applySortOrder,
  applyTimePeriod,
  getDateFromBlockTime,
  toBlockTimeSeconds,
}
