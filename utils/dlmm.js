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

const applyTimePeriod = (
  timePeriod,
  currentWeek,
  prevWeek,
  currentMonth,
  prevMonth,
  currentYear,
  prevYear,
  positions,
) => {
  return positions.filter((position) => {
    const blockDate = DateTime.fromMillis(position.block_time * 1000)
    if (timePeriod === 'all') {
      return true
    }
    if (timePeriod === '1d') {
      return blockDate >= DateTime.now().minus({ day: 1 })
    }
    if (timePeriod === '7d') {
      return blockDate >= DateTime.now().minus({ week: 1 })
    }
    if (timePeriod === '30d') {
      return blockDate >= DateTime.now().minus({ month: 1 })
    }
    if (timePeriod === '1y') {
      return blockDate >= DateTime.now().minus({ year: 1 })
    }
    if (timePeriod === 'week-' + currentWeek) {
      const weekStart = DateTime.now().startOf('week', { useLocaleWeeks: true })
      return blockDate >= weekStart
    }
    if (timePeriod === 'week-' + prevWeek) {
      const weekStart = DateTime.now()
        .minus({ week: 1 })
        .startOf('week', { useLocaleWeeks: true })
      const weekEnd = weekStart.plus({ week: 1 })
      return blockDate >= weekStart && blockDate < weekEnd
    }
    if (timePeriod === 'month-' + currentMonth) {
      const monthStart = DateTime.now().startOf('month')
      return blockDate >= monthStart
    }
    if (timePeriod === 'month-' + prevMonth) {
      const monthStart = DateTime.now().minus({ month: 1 }).startOf('month')
      const monthEnd = monthStart.plus({ month: 1 })
      return blockDate >= monthStart && blockDate < monthEnd
    }
    if (timePeriod === 'year-' + currentYear) {
      const yearStart = DateTime.now().startOf('year')
      return blockDate >= yearStart
    }
    if (timePeriod === 'year-' + prevYear) {
      const yearStart = DateTime.now().minus({ year: 1 }).startOf('year')
      const yearEnd = yearStart.plus({ year: 1 })
      return blockDate >= yearStart && blockDate < yearEnd
    }
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
}
