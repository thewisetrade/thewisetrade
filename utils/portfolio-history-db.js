import Dexie from 'dexie'

let db = null

const getDb = () => {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB is only available in the browser')
  }
  if (!db) {
    class PortfolioHistoryDatabase extends Dexie {
      constructor() {
        super('MeteoraPortfolioHistory')
        this.version(1).stores({
          pools: '[wallet+poolAddress], wallet, lastClosedAt, updatedAt',
        })
        this.version(2).stores({
          pools: '[wallet+poolAddress], wallet, lastClosedAt, updatedAt',
          positionDetails: '&cacheKey, wallet, updatedAt',
          poolPositions: '[wallet+poolAddress+quoteToken], wallet, updatedAt',
        })
      }
    }
    db = new PortfolioHistoryDatabase()
  }
  return db
}

const upsertPools = async (wallet, pools) => {
  if (!wallet || !pools?.length) return 0
  const now = Date.now()
  const rows = pools
    .filter((pool) => pool?.poolAddress)
    .map((pool) => ({
      wallet,
      poolAddress: pool.poolAddress,
      lastClosedAt: pool.lastClosedAt || 0,
      updatedAt: now,
      data: pool,
    }))
  if (!rows.length) return 0
  await getDb().pools.bulkPut(rows)
  return rows.length
}

const getStoredPools = async (wallet) => {
  if (!wallet) return []
  const rows = await getDb().pools.where('wallet').equals(wallet).toArray()
  return rows
    .map((row) => row.data)
    .filter((pool) => pool?.poolAddress)
    .sort((a, b) => (b.lastClosedAt || 0) - (a.lastClosedAt || 0))
}

const getStoredPoolAddresses = async (wallet) => {
  if (!wallet) return []
  const rows = await getDb().pools.where('wallet').equals(wallet).toArray()
  return rows.map((row) => row.poolAddress).filter(Boolean)
}

const countStoredPools = async (wallet) => {
  if (!wallet) return 0
  return getDb().pools.where('wallet').equals(wallet).count()
}

const clearWalletPools = async (wallet) => {
  if (!wallet) return
  const database = getDb()
  await database.pools.where('wallet').equals(wallet).delete()
  await database.positionDetails.where('wallet').equals(wallet).delete()
  await database.poolPositions.where('wallet').equals(wallet).delete()
}

const detailsCacheKey = (wallet, kind, address, quoteToken = '') =>
  `${wallet}|${kind}|${address}|${quoteToken}`

const getPositionDetails = async (wallet, kind, address, quoteToken = '') => {
  if (!wallet || !address) return null
  const row = await getDb().positionDetails.get(
    detailsCacheKey(wallet, kind, address, quoteToken),
  )
  return row?.transactions || null
}

const setPositionDetails = async (
  wallet,
  kind,
  address,
  quoteToken,
  transactions,
) => {
  if (!wallet || !address) return
  await getDb().positionDetails.put({
    cacheKey: detailsCacheKey(wallet, kind, address, quoteToken),
    wallet,
    kind,
    address,
    quoteToken,
    transactions,
    updatedAt: Date.now(),
  })
}

const getPoolPositions = async (wallet, poolAddress, quoteToken = '') => {
  if (!wallet || !poolAddress) return null
  const row = await getDb().poolPositions.get([
    wallet,
    poolAddress,
    quoteToken,
  ])
  return row?.positions || null
}

const setPoolPositions = async (
  wallet,
  poolAddress,
  quoteToken,
  positions,
  poolLastClosedAt = 0,
) => {
  if (!wallet || !poolAddress) return
  await getDb().poolPositions.put({
    wallet,
    poolAddress,
    quoteToken,
    positions,
    poolLastClosedAt: poolLastClosedAt || 0,
    updatedAt: Date.now(),
  })
}

const getAllPoolPositionsMap = async (wallet, quoteToken = '') => {
  if (!wallet) return new Map()
  const rows = await getDb().poolPositions.where('wallet').equals(wallet).toArray()
  const map = new Map()
  rows
    .filter((row) => row.quoteToken === quoteToken && row.poolAddress)
    .forEach((row) => {
      map.set(row.poolAddress, {
        positions: row.positions || [],
        poolLastClosedAt: row.poolLastClosedAt || 0,
        updatedAt: row.updatedAt || 0,
      })
    })
  return map
}

const isPoolPositionsCacheFresh = (pool, cacheEntry) => {
  if (!cacheEntry?.positions?.length) return false
  const poolClosedAt = pool?.lastClosedAt || 0
  if (!poolClosedAt) return true
  return (cacheEntry.poolLastClosedAt || 0) >= poolClosedAt
}

export {
  upsertPools,
  getStoredPools,
  getStoredPoolAddresses,
  countStoredPools,
  clearWalletPools,
  getPositionDetails,
  setPositionDetails,
  getPoolPositions,
  setPoolPositions,
  getAllPoolPositionsMap,
  isPoolPositionsCacheFresh,
}
