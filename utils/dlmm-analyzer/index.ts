// src/index.ts
import { PublicKey } from '@solana/web3.js'
import { QuickNodeService } from './services/quicknode.js'
import { MeteoraService } from './services/meteora.js'
import { PositionAnalyzer } from './services/position-analyzer.js'
import { config } from './config/index.js'

const tokenCache = new Map<string, any>()

async function main(walletAddress: string) {
  console.log('🚀 Starting Meteora DLMM Position Analyzer...\n')
  config.walletAddress = new PublicKey(walletAddress)

  try {
    // Initialize services
    const quickNodeService = new QuickNodeService()
    const meteoraService = new MeteoraService(quickNodeService)
    const positionAnalyzer = new PositionAnalyzer(
      quickNodeService,
      meteoraService,
    )

    const startTime = performance.now()
    console.log(`📊 Analyzing wallet: ${config.walletAddress.toBase58()}`)
    console.log(`📅 Looking back ${config.daysToLookBack} days\n`)

    // Step 1: Get wallet transactions
    console.log('🔍 Fetching wallet transactions...')
    const transactions = await quickNodeService.getWalletTransactions(
      config.walletAddress,
      config.daysToLookBack,
    )
    console.log(`✅ Found ${transactions.length} transactions\n`)
    console.log('time taken', performance.now() - startTime)

    if (transactions.length === 0) {
      console.log('❌ No transactions found for the specified period')
      return []
    }

    // Step 2: Get transaction details
    console.log('📋 Fetching transaction details...')
    const transactionDetails = await quickNodeService.getTransactionDetails(
      transactions.map((tx) => tx.signature),
    )
    console.log(
      `✅ Retrieved ${transactionDetails.length} transaction details\n`,
    )
    console.log('time taken', performance.now() - startTime)

    // Step 3: Filter Meteora transactions
    console.log('🔎 Filtering Meteora DLMM transactions...')
    const meteoraTransactions =
      quickNodeService.filterMeteoraTransactions(transactionDetails)
    console.log(`✅ Found ${meteoraTransactions.length} Meteora transactions\n`)

    if (meteoraTransactions.length === 0) {
      console.log('❌ No Meteora DLMM transactions found')
      return
    }
    console.log('time taken', performance.now() - startTime)

    // Step 4: Parse position open events
    console.log('🏗️  Parsing position open events...')
    const positionEvents =
      meteoraService.parsePositionOpenEvents(meteoraTransactions)
    console.log(`✅ Found ${positionEvents.length} position open events\n`)

    if (positionEvents.length === 0) {
      console.log('❌ No position open events found')
      return []
    }
    console.log('time taken', performance.now() - startTime)

    // Step 5: Get token prices
    console.log('💰 Fetching token prices...')
    const uniqueTokenMints = new Set<string>()

    for (const event of positionEvents) {
      try {
        let lbPair = null
        if (tokenCache.has(event.lbPair.toBase58())) {
          lbPair = tokenCache.get(event.lbPair.toBase58())
        }
        else {
          lbPair = await meteoraService.fetchLbPair(event.lbPair)
          tokenCache.set(event.lbPair.toBase58(), lbPair)
        }
        if (lbPair) {
          uniqueTokenMints.add(lbPair.tokenX.toBase58())
          uniqueTokenMints.add(lbPair.tokenY.toBase58())
        }
      } catch (error) {
        console.warn(`Could not fetch LB pair for ${event.lbPair.toBase58()}`)
      }
    }
    console.log('time taken', performance.now() - startTime)

    const tokenMints = Array.from(uniqueTokenMints).map(
      (mint) => new PublicKey(mint),
    )
    const priceData = await positionAnalyzer.getTokenPrices(tokenMints)
    console.log('🚀 ~ main ~ priceData:', priceData)

    console.log(`✅ Retrieved prices for ${priceData.size} tokens\n`)

    // Step 6: Analyze positions
    console.log('🔬 Analyzing positions...')
    const analysis = await positionAnalyzer.analyzePositions(
      positionEvents,
      priceData,
    )
    console.log(`✅ Analysis complete!\n`)
    console.log('time taken', performance.now() - startTime)

    return analysis
  } catch (error) {
    console.error('❌ Error during analysis:', error)
    return []
  }
}

export { main, QuickNodeService, MeteoraService, PositionAnalyzer }
