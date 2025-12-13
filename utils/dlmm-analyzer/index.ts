// src/index.ts
import { PublicKey } from '@solana/web3.js'

import { QuickNodeService } from './services/quicknode.js'
import { MeteoraService } from './services/meteora.js'
import { PositionAnalyzer } from './services/position-analyzer.js'

async function loadPositionsData(walletAddress: string) {

  console.log('🚀 Loading DLMM positions for wallet:', walletAddress, '\n')
  const wallet = new PublicKey(walletAddress)

  try {
    const quickNodeService = new QuickNodeService(walletAddress)
    const meteoraService = new MeteoraService(quickNodeService)
    const positionAnalyzer = new PositionAnalyzer(meteoraService)

    const startTime = performance.now()
    const pairs = await meteoraService.getUserLbPairs(wallet)
    const analysis = await positionAnalyzer.analyzePositions(pairs)
    const timeTaken = performance.now() - startTime

    console.log(`✅ Analysis complete! Time taken: ${timeTaken}ms`)

    return analysis
  } catch (error) {
    console.warn('❌ Error during analysis:', error)
    throw error
    return []
  }
}

export { loadPositionsData, QuickNodeService, MeteoraService, PositionAnalyzer }
