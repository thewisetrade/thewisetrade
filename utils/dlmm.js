import { DateTime } from 'luxon'
import MeteoraDlmmDb from '@geeklad/meteora-dlmm-db/dist/meteora-dlmm-db'

const loadDlmmDb = async () => {
  const db = await MeteoraDlmmDb.load()
  return db
}

const resetDb = async (db) => {
  await db.waitForSave()
  db = await MeteoraDlmmDb.create()
  await db.save()
  return db
}

const fetchPoolsData = async () => {
  const response = await fetch("https://api.tokleo.com/api/public/pools", {
    headers: {
      'X-Public-Key': 'Daisy-Uncouth-Chrome-Demanding-Freight-Boxcar6'
    }
  })
  const data = await response.json()
  return data.pools
}

const loadWalletTransactions = async (db, endpoint, solanaAddress) => {
  const downloader = await db.download({
    endpoint,
    account: solanaAddress,
    throttleParameters: {
      meteoraDlmm: {
        max: 1,
        interval: 3000,
      },
      rpc: {
        max: 1,
        interval: 1000,
      },
      jupiterTokenList: {
        max: 8,
        interval: 30 * 1000,
      },
    }
  })
  return downloader
}

const getTransactionDate = (transaction) => {
  return new Date(transaction.block_time * 1000).toLocaleString()
}

const getDateFromBlockTime = (blockTime) => {
  return DateTime.fromMillis(blockTime * 1000).toFormat('yyyy-MM-dd HH:mm:ss')
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

const getDbPositions = (groupBy, transactions) => {
  return Object.values(groupTransactionsByPosition(groupBy, transactions))
    .filter((position) => !position.position_is_open)
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

const applyTimePeriod = (timePeriod, positions) => {
  return positions.filter(position => {
    const positionDate = DateTime.fromMillis(position.block_time * 1000)
    return positionDate >= timePeriod.start && positionDate <= timePeriod.end
  })
}

export {
  getDbPositions,
  applyQuoteToken,
  applySortBy,
  applySortOrder,
  applyTimePeriod,
  fetchPoolsData,
  groupTransactionsByPosition,
  getDateFromBlockTime,
  loadDlmmDb,
  loadWalletTransactions,
  resetDb,
}
