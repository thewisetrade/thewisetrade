// src/services/position-analyzer.ts
import BN from 'bn.js';
import { PublicKey } from '@solana/web3.js';
import { QuickNodeService } from './quicknode.js';
import { MeteoraService } from './meteora.js';
import type {
  PositionData,
  PositionAnalysis,
  Position
} from '../types/position.js';
import type {
  PositionOpenEvent,
  TransactionDetails
} from '../types/transaction.js';
import { calculateAge, formatTokenAmount } from '../utils/helpers.js';
import DLMM, { type LbPosition, type PositionInfo } from '@meteora-ag/dlmm';
import {
  loadPositionAnalyzisCache,
  savePositionAnalyzisCache,
  isPositionAnalyzisCached,
  setPositionAnalyzisCached,
} from '../../cache.js';

export class PositionAnalyzer {
  private quickNodeService: QuickNodeService;
  private meteoraService: MeteoraService;

  constructor(quickNodeService: QuickNodeService, meteoraService: MeteoraService) {
    this.quickNodeService = quickNodeService;
    this.meteoraService = meteoraService;
  }

  /**
   * Analyze all positions from position open events
   */
  async analyzePositions(
    pairs: PositionInfo[]
  ): Promise<PositionAnalysis> {
    const positions: PositionData[] = [];
    let totalValue = 0;
    let totalPnl = 0;
    let totalCollectedFees = 0;
    let totalUnCollectedFees = 0;
    let totalAge = 0;

    const positionsData = pairs.reduce((acc, pair) => {
      pair.lbPairPositionsData.forEach(position => {
        position.pair = pair;
      })
      return acc.concat(pair.lbPairPositionsData)
    }, [] as LbPosition[])
    await Promise.all(positionsData.map(async position => {
      try {
        const positionData = await this.analyzePosition(position);
        if (positionData) {
          positions.push(positionData);
          totalValue += positionData.currentValue.totalUsd;
          totalPnl += positionData.upnl.totalUsd;
          totalCollectedFees += positionData.collectedFees.totalUsd;
          totalUnCollectedFees += positionData.unCollectedFees.totalUsd;
          totalAge += positionData.age.days;
        }
      } catch (error) {
        console.error(`Error analyzing position ${position.pair.publicKey.toBase58()}:`, error);
        throw error;
      }
    }))

    return {
      totalPositions: positions.length,
      totalValue,
      totalPnl,
      totalCollectedFees,
      totalUnCollectedFees,
      avgAge: positions.length > 0 ? totalAge / positions.length : 0,
      positions,
    };
  }

  /**
   * Analyze a single position
   */
  async analyzePosition(
    position: LbPosition
  ): Promise<PositionData | null> {
    try {
      const pair = position.pair;
      const token_X_mint = pair.tokenX.mint.address;
      const token_Y_mint = pair.tokenY.mint.address;
      const bins = position.positionData.positionBinData;

      const currentValue = this.meteoraService.calculatePositionValue(bins);
      const unCollectedFees = { tokenX: position.positionData.feeX, tokenY: position.positionData.feeY };
      const collectedFees = { tokenX: position.positionData.totalClaimedFeeXAmount, tokenY: position.positionData.totalClaimedFeeYAmount };

      const tokenXDecimals = await this.meteoraService.getTokenDecimals(token_X_mint);
      const tokenYDecimals = await this.meteoraService.getTokenDecimals(token_Y_mint);
      const tokenXPrice = 0;
      const tokenYPrice = 0;

      const currentValueUsd = this.calculateUsdValue(
        currentValue,
        tokenXDecimals,
        tokenYDecimals,
        tokenXPrice,
        tokenYPrice
      );

      const initialValueUsd = this.calculateUsdValue(
        { tokenX: new BN(0), tokenY: new BN(0) },
        tokenXDecimals,
        tokenYDecimals,
        tokenXPrice,
        tokenYPrice
      );

      const collectedFeesUsd = this.calculateUsdValue(
        collectedFees,
        tokenXDecimals,
        tokenYDecimals,
        tokenXPrice,
        tokenYPrice
      );

      const unCollectedFeesUsd = this.calculateUsdValue(
        unCollectedFees,
        tokenXDecimals,
        tokenYDecimals,
        tokenXPrice,
        tokenYPrice
      );

      // Calculate PnL
      const upnlUsd = currentValueUsd + collectedFeesUsd - initialValueUsd;
      const upnlPercentage = initialValueUsd > 0 ? (upnlUsd / initialValueUsd) * 100 : 0;

      // Calculate price range
      const priceRange = this.meteoraService.getPriceRange(bins);
      const currentPrice = this.meteoraService.calculateBinPrice(bins);

      // Add value field to each bin
      const binsWithValue = bins.map(bin => {
        const binValue = (parseFloat(bin.positionXAmount) * bin.price + parseFloat(bin.positionYAmount))
        return {
          ...bin,
          value: binValue
        }
      })

      const value = (currentValue.tokenX.toNumber() * currentPrice?.currentPrice! + currentValue.tokenY.toNumber()) / 10 ** 9;
      const collectedFeesValue = (collectedFees.tokenX.toNumber() * currentPrice?.currentPrice! + collectedFees.tokenY.toNumber()) / (10 ** 9);
      const unCollectedFeesValue = (unCollectedFees.tokenX.toNumber() * currentPrice?.currentPrice! + unCollectedFees.tokenY.toNumber()) / (10 ** 9);

      const last = bins.length - 1;
      const isInRange = bins[0].binXAmount !== '0' ? 'low' :
        bins[last].binYAmount !== '0' ? 'high' :
          true;

      // Calculate age
      const createdAt = new Date();
      const age = calculateAge(createdAt);

      // Update bins in the original position
      position.positionData.positionBinData = binsWithValue

      return {
        position: {
          ...position,
          pubkey: pair.publicKey,
          lbPair: pair.lbPair.publicKey,
          owner: position.positionData.owner,
          createdAt,
          lastUpdatedAt: new Date(),
        },
        tokenX:token_X_mint,
        tokenY:token_Y_mint,
        currentValue: {
          tokenX: currentValue.tokenX,
          tokenY: currentValue.tokenY,
          totalUsd: currentValueUsd,
        },
        initialValue: {
          tokenX: new BN(0),
          tokenY: new BN(0),
          totalUsd: initialValueUsd,
        },
        collectedFees: {
          tokenX: collectedFees.tokenX,
          tokenY: collectedFees.tokenY,
          totalUsd: collectedFeesUsd,
        },
        unCollectedFees: {
          tokenX: unCollectedFees.tokenX,
          tokenY: unCollectedFees.tokenY,
          totalUsd: unCollectedFeesUsd,
        },
        upnl: {
          tokenX: new BN(0),
          tokenY: new BN(0),
          totalUsd: upnlUsd,
          percentage: upnlPercentage,
        },
        priceRange: {
          minPrice: priceRange.minPrice,
          maxPrice: priceRange.maxPrice,
          currentPrice: currentPrice!.currentPrice
        },
        collectedFeesValue,
        unCollectedFeesValue,
        value,
        age,
        isInRange,
      };
    } catch (error) {
      console.error(`Error analyzing position:`, error);
      return null;
    }
  }

  /**
   * Get collected fees from transaction history
   */
  private async getCollectedFees(positionPubkey: PublicKey): Promise<{ tokenX: BN; tokenY: BN }> {
    try {
      // This would require fetching all transactions that interacted with this position
      // and parsing fee collection events. For now, returning zero as placeholder.
      // In a complete implementation, you would:
      // 1. Get all transactions for this position
      // 2. Filter for fee collection transactions
      // 3. Sum up all collected fees

      return { tokenX: new BN(0), tokenY: new BN(0) };
    } catch (error) {
      console.error('Error getting collected fees:', error);
      return { tokenX: new BN(0), tokenY: new BN(0) };
    }
  }

  /**
   * Calculate USD value from token amounts
   */
  private calculateUsdValue(
    amounts: { tokenX: BN; tokenY: BN },
    tokenXDecimals: number,
    tokenYDecimals: number,
    tokenXPrice: number,
    tokenYPrice: number
  ): number {
    const tokenXAmount = parseFloat(formatTokenAmount(amounts.tokenX, tokenXDecimals));
    const tokenYAmount = parseFloat(formatTokenAmount(amounts.tokenY, tokenYDecimals));

    return (tokenXAmount * tokenXPrice) + (tokenYAmount * tokenYPrice);
  }

  /**
   * Get token prices from external API or cache
   */
  async getTokenPrices(tokenMints: PublicKey[]): Promise<Map<string, number>> {
    const prices = new Map<string, number>();

    try {
      // This is a placeholder. In a real implementation, you would:
      // 1. Use a price API like CoinGecko, Jupiter, or Birdeye
      // 2. Fetch current prices for all token mints
      // 3. Handle price caching for efficiency

      // Example hardcoded prices (replace with actual API calls)
      const knownPrices: Record<string, number> = {
        'So11111111111111111111111111111111111111112': 100, // SOL
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 1, // USDC
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 1, // USDT
      };

      for (const mint of tokenMints) {
        const mintStr = mint.toBase58();
        prices.set(mintStr, knownPrices[mintStr] || 0);
      }
    } catch (error) {
      console.error('Error fetching token prices:', error);
    }

    return prices;
  }

  /**
   * Generate position summary report
   */
  generateReport(analysis: PositionAnalysis): string {
    const report = `
# Meteora DLMM Position Analysis Report

## Summary
- **Total Positions**: ${analysis.totalPositions}
- **Total Value**: $${analysis.totalValue.toLocaleString()}
- **Total PnL**: $${analysis.totalPnl.toLocaleString()} (${analysis.totalPnl >= 0 ? '+' : ''}${((analysis.totalPnl / analysis.totalValue) * 100).toFixed(2)}%)
- **Total Collected Fees**: $${analysis.totalCollectedFees.toLocaleString()}
- **Total Uncollected Fees**: $${analysis.totalUnCollectedFees.toLocaleString()}
- **Average Position Age**: ${analysis.avgAge.toFixed(1)} days

## Individual Positions

${analysis.positions.map((pos, index) => `
### Position ${index + 1}
- **Address**: ${pos.position.pubkey.toBase58()}
- **LB Pair**: ${pos.position.lbPair.toBase58()}
- **Current Value**: $${pos.currentValue.totalUsd.toLocaleString()}
- **Current Y token Value**: $${pos.currentValue.tokenY.toString()}
- **Current X token Value**: $${pos.currentValue.tokenX.toString()}
- **Initial Value**: $${pos.initialValue.totalUsd.toLocaleString()}
- **PnL**: $${pos.upnl.totalUsd.toLocaleString()} (${pos.upnl.percentage >= 0 ? '+' : ''}${pos.upnl.percentage.toFixed(2)}%)
- **Collected Fees**: $${pos.collectedFees.totalUsd.toLocaleString()}
- **Collected X token Fees**: $${pos.collectedFees.tokenX.toLocaleString()}
- **Collected Y token Fees**: $${pos.collectedFees.tokenY.toLocaleString()}
- **Uncollected Fees**: $${pos.unCollectedFees.totalUsd.toLocaleString()}
- **Uncollected  X token Fees**: $${pos.unCollectedFees.tokenX.toLocaleString()}
- **Uncollected  Y token Fees**: $${pos.unCollectedFees.tokenY.toLocaleString()}
- **Price Range**: ${pos.priceRange.minPrice.toFixed(6)} - ${pos.priceRange.maxPrice.toFixed(6)}
- **Current Price**: ${pos.priceRange.currentPrice.toFixed(6)}
- **In Range**: ${pos.isInRange}
- **Value in SOl**: ${pos.value}
- **Collected Fees in SOl**: ${pos.collectedFeesValue}
- **Uncollected Fees in SOl**: ${pos.unCollectedFeesValue}
- **Age**: ${pos.age.days}d ${pos.age.hours}h ${pos.age.minutes}m

`).join('')}
    `.trim();

    return report;
  }

  /**
   * Export position data to JSON
   */
  exportToJson(analysis: PositionAnalysis): string {
    return JSON.stringify(analysis, (key, value) => {
      // Handle BN serialization
      if (value && typeof value === 'object' && value.constructor && value.constructor.name === 'BN') {
        return value.toString();
      }
      // Handle PublicKey serialization
      if (value && typeof value === 'object' && value.constructor && value.constructor.name === 'PublicKey') {
        return value.toBase58();
      }
      return value;
    }, 2);
  }
}