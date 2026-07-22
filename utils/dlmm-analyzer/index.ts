// src/index.ts
import { PublicKey } from '@solana/web3.js'

import { QuickNodeService } from './services/quicknode.js'
import { MeteoraService } from './services/meteora.js'
import { PositionAnalyzer } from './services/position-analyzer.js'

async function loadPositionsData(walletAddress: string) {
  const wallet = new PublicKey(walletAddress)

  try {
    const quickNodeService = new QuickNodeService(walletAddress)
    const meteoraService = new MeteoraService(quickNodeService)
    const positionAnalyzer = new PositionAnalyzer(meteoraService)

    const pairs = await meteoraService.getUserLbPairs(wallet)
    return await positionAnalyzer.analyzePositions(pairs)
  } catch (error) {
    console.log('SDK positions unavailable:', error?.message || error)
    return {
      totalPositions: 0,
      totalValue: 0,
      totalPnl: 0,
      totalCollectedFees: 0,
      totalUnCollectedFees: 0,
      avgAge: 0,
      positions: [],
    }
  }
}

export { loadPositionsData, QuickNodeService, MeteoraService, PositionAnalyzer }
