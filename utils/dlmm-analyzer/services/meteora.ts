// src/services/meteora.ts
import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'
import { QuickNodeService } from './quicknode.js'
import DLMM, { type PositionBinData, type PositionInfo } from '@meteora-ag/dlmm'

interface BinPriceResult {
  currentPrice: number
  pricePerToken: number
  binId?: number
  positionXAmount?: string
  positionYAmount?: string
  binInfo?: PositionBinData
  priceStep?: number
  pricePerTokenStep?: number
  estimatedPrice?: boolean // indicates if price was estimated
}

export class MeteoraService {
  private quickNodeService: QuickNodeService

  constructor(quickNodeService: QuickNodeService) {
    this.quickNodeService = quickNodeService
  }

  /**
   * Calculate bin price from bin ID
   */
  calculateBinPrice(bins: PositionBinData[]): BinPriceResult | null {
    if (bins.length === 0) return null

    // Calculate price step from any two consecutive bins
    const calculatePriceStep = (): { step: number; stepPerToken: number } => {
      if (bins.length < 2) return { step: 0, stepPerToken: 0 }

      // Sort bins by binId to ensure correct order
      //const sortedBins = [...bins].sort((a, b) => a.binId - b.binId);

      // Calculate step from first two bins
      const step = parseFloat(bins[1].price) - parseFloat(bins[0].price)
      const stepPerToken =
        parseFloat(bins[1].pricePerToken) - parseFloat(bins[0].pricePerToken)
      return { step, stepPerToken }
    }

    // First, try to find active bin
    const activeBin = bins.find(
      (bin) => bin.positionXAmount !== '0' && bin.positionYAmount !== '0',
    )

    if (activeBin) {
      return {
        currentPrice: parseFloat(activeBin.price),
        pricePerToken: parseFloat(activeBin.pricePerToken),
        binId: activeBin.binId,
        positionXAmount: activeBin.positionXAmount,
        positionYAmount: activeBin.positionYAmount,
        binInfo: activeBin,
        priceStep: calculatePriceStep().step,
        pricePerTokenStep: calculatePriceStep().stepPerToken,
        estimatedPrice: false,
      }
    }

    // No active bin found - estimate current price
    const priceStep = calculatePriceStep()
    const lastIndex = bins.length - 1

    // Sort bins to get proper first and last
    const sortedBins = [...bins].sort((a, b) => a.binId - b.binId)
    const firstBin = sortedBins[0]
    const lastBin = sortedBins[lastIndex]

    let estimatedPrice: number
    let estimatedPricePerToken: number
    let referenceBin: PositionBinData

    // If first bin has no Y amount, price is below first bin
    if (firstBin.positionYAmount === '0') {
      estimatedPrice = parseFloat(firstBin.price) - priceStep.step
      estimatedPricePerToken =
        parseFloat(firstBin.pricePerToken) - priceStep.stepPerToken
      referenceBin = firstBin
    }
    // If last bin has no X amount, price is above last bin
    else if (lastBin.positionXAmount === '0') {
      estimatedPrice = parseFloat(lastBin.price) + priceStep.step
      estimatedPricePerToken =
        parseFloat(lastBin.pricePerToken) + priceStep.stepPerToken
      referenceBin = lastBin
    }
    // Fallback - use middle bin or first available
    else {
      const middleBin = bins[Math.floor(bins.length / 2)]
      estimatedPrice = parseFloat(middleBin.price)
      referenceBin = middleBin
    }

    return {
      currentPrice: estimatedPrice,
      pricePerToken: estimatedPrice, // Assuming same relationship
      binId: referenceBin.binId,
      positionXAmount: referenceBin.positionXAmount,
      positionYAmount: referenceBin.positionYAmount,
      binInfo: referenceBin,
      priceStep: priceStep.step,
      pricePerTokenStep: priceStep.stepPerToken,
      estimatedPrice: true,
    }
  }

  /**
   * Get price range for a position
   */
  getPriceRange(bins: PositionBinData[]): {
    minPrice: number
    maxPrice: number
  } {
    const prices = bins.map((bin) => parseFloat(bin.price))
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    return {
      minPrice,
      maxPrice,
    }
  }

  /**
   * Calculate position value in tokens
   */
  calculatePositionValue(
    // position: Position,
    bins: PositionBinData[],
  ): { tokenX: BN; tokenY: BN } {
    let totalTokenX = new BN(0)
    let totalTokenY = new BN(0)
    let total = new BN(0)

    // for (let i = 0; i < position.binIds.length; i++) {
    //     const binId = position.binIds[i];
    //     const liquidityShare = position.liquidityShares[i];
    //     const bin = bins.get(binId);

    //     if (bin && !liquidityShare.isZero()) {
    //         // Calculate user's share of the bin
    //         const shareRatio = liquidityShare.mul(new BN(1000000)).div(bin.liquiditySupply);

    //         const userTokenX = bin.reserveX.mul(shareRatio).div(new BN(1000000));
    //         const userTokenY = bin.reserveY.mul(shareRatio).div(new BN(1000000));

    //         totalTokenX = totalTokenX.add(userTokenX);
    //         totalTokenY = totalTokenY.add(userTokenY);
    //     }
    // }

    bins.map((bin) => {
      totalTokenX = totalTokenX.add(new BN(bin.positionXAmount))
      totalTokenY = totalTokenY.add(new BN(bin.positionYAmount))
    })

    return { tokenX: totalTokenX, tokenY: totalTokenY }
  }

  /**
   * Get token decimals
   */
  async getTokenDecimals(mintAddress: PublicKey): Promise<number> {
    try {
      const tokenSupply =
        await this.quickNodeService.getTokenSupply(mintAddress)
      return tokenSupply.decimals
    } catch (error) {
      console.error(
        `Error getting token decimals for ${mintAddress.toBase58()}:`,
        error,
      )
      return 9 // Default to 9 decimals if unable to fetch
    }
  }

  async getUserLbPairs(walletAddress: PublicKey): Promise<PositionInfo[]> {
    const connection = await this.quickNodeService.getConnection()
    const userPositions = await DLMM.getAllLbPairPositionsByUser(
      connection,
      walletAddress
    );
    return Array.from(userPositions.values())
  }
}
