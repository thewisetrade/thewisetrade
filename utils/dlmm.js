import { DateTime } from 'luxon'
import MeteoraDlmmDb from '@geeklad/meteora-dlmm-db/dist/meteora-dlmm-db'

const loadDlmmDb = async () => {
  const db = await MeteoraDlmmDb.load()
  return { db }
}

const loadWalletTransactions = async (endpoint, solanaAddress) => {
  const { loadDlmmDb } = await import('@/utils/dlmm')
  const { db } = await loadDlmmDb()

  const downloader = await db.download({
    endpoint,
    account: solanaAddress,
  })
  return { db, downloader }
}

const getTransactionDate = (transaction) => {
  return new Date(transaction.block_time * 1000).toLocaleString()
}

const getDbPositions = (groupBy, transactions) => {
  return Object.values(groupTransactionsByPosition(groupBy, transactions))
    .sort((a, b) => b.block_time - a.block_time)
    .map((position) => {
      return {
        ...position,
        deposit: position.transactions.reduce(
          (acc, transaction) => acc + transaction.deposit,
          0,
        ),
        withdrawal: position.transactions.reduce(
          (acc, transaction) => acc + transaction.withdrawal,
          0,
        ),
        fee_amount: position.transactions.reduce(
          (acc, transaction) => acc + transaction.fee_amount,
          0,
        ),
      }
    })
    .map((position) => {
      return {
        ...position,
        profit: position.withdrawal - position.deposit + position.fee_amount,
      }
    })
    .filter((position) => !position.position_is_open)
    .sort((a, b) => b.profit - a.profit)
}

const applyQuoteToken = (quoteToken, positions) => {
  return positions.filter((position) => position.quote_symbol === quoteToken)
}

const applySortBy = (sortBy, positions) => {
  return positions.sort((a, b) => {
    return sortBy === 'profit'
      ? b.profit - a.profit
      : b.block_time - a.block_time
  })
}

const applySortOrder = (sortOrder, positions) => {
  return sortOrder === 'desc' ? positions.reverse() : positions
}

const getDateFromBlockTime = (blockTime) => {
  return DateTime.fromMillis(blockTime * 1000).toFormat('yyyy-MM-dd HH:mm:ss')
}

const applyTimePeriod = (timePeriod, positions) => {
  return positions.filter(position => {
    const positionDate = DateTime.fromMillis(position.block_time * 1000)
    if (!(positionDate >= timePeriod.start && positionDate <= timePeriod.end)) {
      console.log('positionDate', position.quoteToken, positionDate, timePeriod.start, timePeriod.end, positionDate >= timePeriod.start, positionDate <= timePeriod.end)
    }
    return positionDate >= timePeriod.start && positionDate <= timePeriod.end
  })
}

const groupTransactionsByPosition = (groupBy, transactions) => {
  const grouped = {}
  transactions.forEach(transaction => {
    const key =
      groupBy === 'position'
        ? transaction.position_address
        : `${transaction.base_symbol}-${transaction.quote_symbol}`
    if (!grouped[key]) {
      grouped[key] = {
        transactions: [],
        position_is_open: transaction.position_is_open,
        block_time: transaction.block_time,
        base_symbol: transaction.base_symbol,
        quote_symbol: transaction.quote_symbol,
        position_address: transaction.position_address,
        block_time: transaction.block_time,
        signature: transaction.signature,
      }
    }
    grouped[key].transactions.push(transaction)
  })
  return grouped
}

const resetDb = async (db, downloader) => {
  if (downloader) {
    downloader.cancel()
    downloader.cancel()
  }
  await db.waitForSave()
  db = await MeteoraDlmmDb.create()
  await db.save()
  return { db }
}

export {
  getDbPositions,
  applyQuoteToken,
  applySortBy,
  applySortOrder,
  applyTimePeriod,
  groupTransactionsByPosition,
  getDateFromBlockTime,
  loadDlmmDb,
  loadWalletTransactions,
  resetDb,
}
