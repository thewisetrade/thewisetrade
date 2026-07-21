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
    console.warn('Error during analysis:', error)
    throw error
  }
}

export { loadPositionsData, QuickNodeService, MeteoraService, PositionAnalyzer }
