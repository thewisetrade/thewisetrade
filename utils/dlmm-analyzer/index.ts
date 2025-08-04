// src/index.ts
import { PublicKey } from '@solana/web3.js'
import { QuickNodeService } from './services/quicknode.js'
import { MeteoraService } from './services/meteora.js'
import { PositionAnalyzer } from './services/position-analyzer.js'
import type { TransactionDetails } from './types/transaction.js'

import { isPositionAnalyzisCached } from '../cache.js'

const tokenCache = new Map<string, any>()

async function getTransactions(
  quickNodeService: QuickNodeService,
  wallet: PublicKey,
) {
  const transactions = await quickNodeService.getPastWeekTransactions(wallet)
  if (transactions.length > 0) {
    console.log(`✅ Found ${transactions.length} transactions\n`)
  } else {
    throw new Error('❌ No transactions found for the specified period')
  }
  return transactions
}

async function getTransactionDetails(
  quickNodeService: QuickNodeService,
  transactions: TransactionSignature[],
) {
  const transactionDetails = await quickNodeService.getTransactionDetails(
    transactions.map((tx) => tx.signature),
  )
  console.log(`✅ Retrieved ${transactionDetails.length} transaction details\n`)
  return transactionDetails
}

async function getMeteoraTransactions(
  quickNodeService: QuickNodeService,
  transactionDetails: TransactionDetails[],
) {
  const meteoraTransactions =
    quickNodeService.filterMeteoraTransactions(transactionDetails)
  console.log(`✅ Found ${meteoraTransactions.length} Meteora transactions\n`)
  if (meteoraTransactions.length === 0) {
    throw new Error('❌ No Meteora transactions found for the specified period')
  }
  return meteoraTransactions
}

async function parsePositionOpenEvents(
  meteoraService: MeteoraService,
  meteoraTransactions: TransactionDetails[],
) {
  const positionEvents =
    meteoraService.parsePositionOpenEvents(meteoraTransactions)
  console.log(`✅ Found ${positionEvents.length} position open events\n`)
  if (positionEvents.length === 0) {
    throw new Error('❌ No position open events found')
  }
  return positionEvents
}

async function getTokenPrices(
  walletAddress: string,
  meteoraService: MeteoraService,
  positionAnalyzer: PositionAnalyzer,
  positionEvents: PositionOpenEvent[],
) {
  const uniqueTokenMints = new Set<string>()

  for (const event of positionEvents) {
    try {
      if (isPositionAnalyzisCached(walletAddress, event)) continue
      let lbPair = null
      if (tokenCache.has(event.lbPair)) {
        lbPair = tokenCache.get(event.lbPair)
      } else {
        lbPair = await meteoraService.fetchLbPair(new PublicKey(event.lbPair))
        tokenCache.set(event.lbPair, lbPair)
      }
      if (lbPair) {
        uniqueTokenMints.add(lbPair.tokenX.toBase58())
        uniqueTokenMints.add(lbPair.tokenY.toBase58())
      } else {
        // console.debug('lbPair does not exist, skipping')
      }
    } catch (error) {
      console.warn(`Could not fetch LB pair for ${event.lbPair.toBase58()}`)
    }
  }

  const tokenMints = Array.from(uniqueTokenMints).map(
    (mint) => new PublicKey(mint),
  )
  const priceData = await positionAnalyzer.getTokenPrices(tokenMints)
  console.log(`✅ Retrieved prices for ${priceData.size} tokens\n`)
}

async function loadPositionsData(walletAddress: string) {
  console.log('🚀 Starting Meteora DLMM Position Analyzer...\n')
  const wallet = new PublicKey(walletAddress)

  try {
    const quickNodeService = new QuickNodeService(walletAddress)
    const meteoraService = new MeteoraService(quickNodeService)
    const positionAnalyzer = new PositionAnalyzer(
      quickNodeService,
      meteoraService,
    )

    // const startTime = performance.now()
    // console.log('time taken', performance.now() - startTime)
    console.log(`📊 Analyzing wallet: ${wallet.toBase58()}`)
    const transactions = await getTransactions(quickNodeService, wallet)
    console.log('transactions', transactions)
    const transactionDetails = await getTransactionDetails(
      quickNodeService,
      transactions,
    )
    console.log('transactionDetails', transactionDetails)
    /*
    const meteoraTransactions = await getMeteoraTransactions(
      quickNodeService,
      transactionDetails,
    )
    console.log('meteoraTransactions', meteoraTransactions)
    const positionEvents = await parsePositionOpenEvents(
      meteoraService,
      meteoraTransactions,
    )
    console.log('positionEvents', positionEvents)
    const priceData = await getTokenPrices(
      walletAddress,
      meteoraService,
      positionAnalyzer,
      positionEvents,
    )
    const analysis = await positionAnalyzer.analyzePositions(
      walletAddress,
      positionEvents,
      priceData,
    )
    console.log(`✅ Analysis complete!\n`)
    return analysis
    */
    return []
  } catch (error) {
    console.warn('❌ Error during analysis:', error)
    throw error
    return []
  }
}

export { loadPositionsData, QuickNodeService, MeteoraService, PositionAnalyzer }
