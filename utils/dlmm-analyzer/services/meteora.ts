// src/services/meteora.ts
import { PublicKey, type AccountInfo } from '@solana/web3.js'
import BN from 'bn.js'
import { QuickNodeService } from './quicknode.js'
import DLMM, { type LbPosition, type PositionBinData } from '@meteora-ag/dlmm'

import type {
  TransactionDetails,
  PositionOpenEvent,
} from '../types/transaction.js'
import type { Position, MeteoraPool, LbPair, Bin } from '../types/meteora.js'
import { METEORA_CONSTANTS, INSTRUCTION_NAMES } from '../utils/constants.js'
import { config } from '../config/index.js'

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
   * Parse Meteora DLMM transactions to find position opening events
   */
  parsePositionOpenEvents(
    transactions: TransactionDetails[],
  ): PositionOpenEvent[] {
    const events: PositionOpenEvent[] = []

    for (const tx of transactions) {
      try {
        const meteoraInstructions = tx.transaction.message.instructions.filter(
          (ix) => ix.programId.equals(config.meteoraProgramId),
        )

        for (const instruction of meteoraInstructions) {
          // Check for add liquidity instructions (position opening)
          if (
            this.isAddLiquidityInstruction(instruction, tx.meta.logMessages)
          ) {
            const event = this.parseAddLiquidityEvent(tx, instruction)
            if (event) {
              events.push(event)
            }
          }
        }
      } catch (error) {
        console.error(`Error parsing transaction ${tx.signature}:`, error)
      }
    }

    return events
  }

  /**
   * Check if instruction is an add liquidity instruction
   */
  private isAddLiquidityInstruction(
    instruction: any,
    logMessages: string[],
  ): boolean {
    // Check instruction data or log messages for add liquidity patterns
    const addLiquidityPatterns = [
      'Program log: Instruction: AddLiquidity',
      'Program log: Instruction: AddLiquidityByWeight',
      'Program log: Instruction: AddLiquidityByStrategy',
      'Program log: Instruction: InitializePosition',
    ]

    return logMessages.some((log) =>
      addLiquidityPatterns.some((pattern) => log.includes(pattern)),
    )
  }

  /**
   * Parse add liquidity event from transaction
   */
  private parseAddLiquidityEvent(
    tx: TransactionDetails,
    instruction: any,
  ): PositionOpenEvent | null {
    try {
      // Parse instruction accounts to extract position info
      const accounts = instruction.accounts
      if (accounts.length < 8) return null

      // Account layout for add liquidity instruction (typical order):
      // 0: Position
      // 1: LB Pair
      // 2: User token X
      // 3: User token Y
      // 4: Reserve X
      // 5: Reserve Y
      // 6: Token X mint
      // 7: Token Y mint
      // 8: Bin array bitmap extension (optional)
      // 9: User (payer/owner)

      const positionPubkey = accounts[0]
      const lbPair = accounts[1]
      const owner = accounts[accounts.length - 1] // Usually the last account

      // Extract bin IDs and amounts from logs
      const { binIds, amounts } = this.parseAmountsFromLogs(tx.meta.logMessages)

      return {
        signature: tx.signature,
        blockTime: tx.blockTime,
        positionPubkey,
        lbPair,
        owner,
        binIds,
        amounts,
      }
    } catch (error) {
      console.error('Error parsing add liquidity event:', error)
      return null
    }
  }

  /**
   * Parse amounts and bin IDs from transaction logs
   */
  private parseAmountsFromLogs(logMessages: string[]): {
    binIds: number[]
    amounts: { tokenX: BN; tokenY: BN }
  } {
    const binIds: number[] = []
    let tokenX = new BN(0)
    let tokenY = new BN(0)

    for (const log of logMessages) {
      // Parse bin IDs from logs like "Program log: bin_id: 123"
      const binIdMatch = log.match(/bin_id:\s*(-?\d+)/)
      if (binIdMatch) {
        binIds.push(parseInt(binIdMatch[1]))
      }

      // Parse amounts from logs like "Program log: amount_x: 1000000"
      const amountXMatch = log.match(/amount_x:\s*(\d+)/)
      if (amountXMatch) {
        tokenX = tokenX.add(new BN(amountXMatch[1]))
      }

      const amountYMatch = log.match(/amount_y:\s*(\d+)/)
      if (amountYMatch) {
        tokenY = tokenY.add(new BN(amountYMatch[1]))
      }
    }

    return { binIds, amounts: { tokenX, tokenY } }
  }

  /**
   * Fetch current position data from chain
   */
  async fetchPosition(
    positionPubkey: PublicKey,
    lbPair: PublicKey,
  ): Promise<LbPosition | null> {
    try {
      const connection = await this.quickNodeService.getConnection()
      //console.log("🚀 ~ MeteoraService ~ fetchPosition ~ connection:", connection)
      const accountInfo = await connection.getAccountInfo(positionPubkey)
      //console.log("🚀 ~ MeteoraService ~ fetchPosition ~ accountInfo:", accountInfo)
      const dlmmPool = await DLMM.create(connection, lbPair)
      const positionInfo = await dlmmPool.getPosition(positionPubkey)
      console.log(
        '🚀 ~ MeteoraService ~ fetchPosition ~ positionInfo:',
        positionInfo.positionData,
      )

      if (!positionInfo) return null
      return positionInfo
      //return this.deserializePosition(positionPubkey, accountInfo);
    } catch (error) {
      //console.error(`Error fetching position ${positionPubkey.toBase58()}:`, error);
      return null
    }
  }
  //get positions with position
  // async getWalletPositionsInPool(
  //     poolAddress: string,
  //     walletAddress: string
  // ): Promise<UserPosition[]> {
  //     try {
  //         // Wait for rate limit availability
  //         await this.rateLimiter.waitForAvailableSlot();

  //         logger.debug(`Getting positions for wallet ${walletAddress} in pool ${poolAddress}`);

  //         const dlmmPool = await DLMM.create(this.connection, new PublicKey(poolAddress));

  //         // This is another rate-limited call
  //         await this.rateLimiter.waitForAvailableSlot();

  //         const { userPositions } = await dlmmPool.getPositionsByUserAndLbPair(
  //             new PublicKey(walletAddress)
  //         );

  //         if (userPositions.length === 0) {
  //             return [];
  //         }

  //         const positions: UserPosition[] = userPositions.map((position) => {
  //             const binData = position.positionData.positionBinData.map(bin => ({
  //                 binId: bin.binId,
  //                 liquidityAmount: bin.binLiquidity.toString(),
  //                 pricePerToken: this.calculateBinPrice(bin.binId, dlmmPool.lbPair.binStep)
  //             }));

  //             return {
  //                 positionAddress: position.publicKey.toString(),
  //                 owner: walletAddress,
  //                 poolAddress: poolAddress,
  //                 poolName: dlmmPool.tokenX.mint + '-' + dlmmPool.tokenY.mint,
  //                 binData: binData,
  //                 unclaimedFees: {
  //                     tokenX: position.positionData.feeX.toString(),
  //                     tokenY: position.positionData.feeY.toString()
  //                 },
  //                 rewards: {
  //                     rewardOne: position.positionData.rewardOne.toString(),
  //                     rewardTwo: position.positionData.rewardTwo.toString()
  //                 },
  //                 lastUpdated: new Date()
  //             };
  //         });

  //         logger.debug(`Found ${positions.length} positions in pool ${poolAddress}`);
  //         return positions;

  //     } catch (error) {
  //         logger.warn(`Error getting positions for pool ${poolAddress}:`, error);
  //         return [];
  //     }
  // }

  /**
   * Deserialize position account data
   */
  private deserializePosition(
    pubkey: PublicKey,
    accountInfo: AccountInfo<Buffer>,
  ): Position {
    const data = accountInfo.data
    console.log('🚀 ~ MeteoraService ~ deserializePosition ~ data:', data)
    if (data.length < 8) {
      throw new Error(
        `Invalid position account data: too small (${data.length} bytes)`,
      )
    }
    // Position account layout (simplified - actual layout may vary)
    // This is a basic deserialization - you may need to adjust based on actual Meteora account structure
    let offset = 8 // Skip discriminator
    if (data.length < offset + 64) {
      // Need at least 64 bytes for lbPair + owner
      throw new Error(
        `Invalid position account data: insufficient data for basic fields`,
      )
    }
    const lbPair = new PublicKey(data.slice(offset, offset + 32))
    console.log('🚀 ~ MeteoraService ~ deserializePosition ~ lbPair:', lbPair)
    offset += 32

    const owner = new PublicKey(data.slice(offset, offset + 32))
    console.log('🚀 ~ MeteoraService ~ deserializePosition ~ owner:', owner)
    offset += 32
    // Check if we have enough data to read bin count
    if (data.length < offset + 4) {
      console.warn(
        `Position ${pubkey.toBase58()}: No bin data available, creating empty position`,
      )
      return {
        pubkey,
        lbPair,
        owner,
        binIds: [],
        liquidityShares: [],
        feeOwed: {
          tokenX: new BN(0),
          tokenY: new BN(0),
        },
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      }
    }
    // Read number of bins

    const binCount = data.readUInt32LE(offset)
    offset += 4
    // Validate bin count is reasonable
    if (binCount > METEORA_CONSTANTS.MAX_BIN_PER_POSITION) {
      throw new Error(
        `Invalid bin count: ${binCount} exceeds maximum ${METEORA_CONSTANTS.MAX_BIN_PER_POSITION}`,
      )
    }
    const binIds: number[] = []
    const liquidityShares: BN[] = []

    // Calculate required bytes for bin data
    const requiredBytesForBins = binCount * (4 + 8) // 4 bytes for binId + 8 bytes for liquidity
    if (data.length < offset + requiredBytesForBins) {
      console.warn(
        `Position ${pubkey.toBase58()}: Insufficient data for ${binCount} bins, reading available bins only`,
      )
      // Read as many bins as we have data for
      const availableBins = Math.floor((data.length - offset) / 12)
      for (let i = 0; i < Math.min(binCount, availableBins); i++) {
        if (offset + 4 <= data.length) {
          const binId = data.readInt32LE(offset)
          offset += 4
          binIds.push(binId)

          if (offset + 8 <= data.length) {
            const liquidityShare = new BN(data.slice(offset, offset + 8), 'le')
            offset += 8
            liquidityShares.push(liquidityShare)
          } else {
            liquidityShares.push(new BN(0))
            break
          }
        } else {
          break
        }
      }
    } else {
      // Read all bins normally
      for (let i = 0; i < binCount; i++) {
        const binId = data.readInt32LE(offset)
        offset += 4
        binIds.push(binId)

        const liquidityShare = new BN(data.slice(offset, offset + 8), 'le')
        offset += 8
        liquidityShares.push(liquidityShare)
      }
    }

    // Fee information with bounds checking
    let feeOwedX = new BN(0)
    let feeOwedY = new BN(0)

    if (data.length >= offset + 16) {
      feeOwedX = new BN(data.slice(offset, offset + 8), 'le')
      offset += 8
      feeOwedY = new BN(data.slice(offset, offset + 8), 'le')
      offset += 8
    } else if (data.length >= offset + 8) {
      feeOwedX = new BN(data.slice(offset, offset + 8), 'le')
    }
    const returnData = {
      pubkey,
      lbPair,
      owner,
      binIds,
      liquidityShares,
      feeOwed: {
        tokenX: feeOwedX,
        tokenY: feeOwedY,
      },
      createdAt: new Date(), // This should be derived from creation transaction
      lastUpdatedAt: new Date(),
    }
    console.log('position data::', returnData)

    return {
      pubkey,
      lbPair,
      owner,
      binIds,
      liquidityShares,
      feeOwed: {
        tokenX: feeOwedX,
        tokenY: feeOwedY,
      },
      createdAt: new Date(), // This should be derived from creation transaction
      lastUpdatedAt: new Date(),
    }
  }

  /**
   * Fetch LB Pair data
   */
  async fetchLbPair(lbPairPubkey: PublicKey): Promise<LbPair | null> {
    //console.log("🚀 ~ MeteoraService ~ fetchLbPair ~ lbPairPubkey:", lbPairPubkey)
    try {
      const connection = await this.quickNodeService.getConnection()
      const accountInfo = await connection.getAccountInfo(lbPairPubkey)

      if (!accountInfo) return null

      return this.deserializeLbPair(lbPairPubkey, accountInfo)
    } catch (error) {
      //console.error(`Error fetching LB pair ${lbPairPubkey.toBase58()}:`, error);
      return null
    }
  }

  /**
   * Deserialize LB Pair account data
   */
  private deserializeLbPair(
    pubkey: PublicKey,
    accountInfo: AccountInfo<Buffer>,
  ): LbPair {
    const data = accountInfo.data
    let offset = 8 // Skip discriminator

    const tokenX = new PublicKey(data.slice(offset, offset + 32))
    offset += 32

    const tokenY = new PublicKey(data.slice(offset, offset + 32))
    offset += 32

    const binStep = data.readUInt16LE(offset)
    offset += 2

    const reserveX = new BN(data.slice(offset, offset + 8), 'le')
    offset += 8

    const reserveY = new BN(data.slice(offset, offset + 8), 'le')
    offset += 8

    const activeId = data.readInt32LE(offset)
    offset += 4

    return {
      pubkey,
      tokenX,
      tokenY,
      binStep,
      reserveX,
      reserveY,
      activeId,
      bins: new Map(), // Will be populated separately
    }
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
   * Fetch bin data for multiple bin IDs
   */
  async fetchBins(
    lbPairPubkey: PublicKey,
    binIds: number[],
  ): Promise<Map<number, Bin>> {
    const bins = new Map<number, Bin>()

    try {
      // Calculate bin array addresses for the given bin IDs
      const binArrayAddresses = this.getBinArrayAddresses(lbPairPubkey, binIds)

      const connection = await this.quickNodeService.getConnection()
      const accountInfos =
        await this.quickNodeService.getMultipleAccountsInfo(binArrayAddresses)

      for (let i = 0; i < accountInfos.length; i++) {
        const accountInfo = accountInfos[i]
        if (accountInfo) {
          const binArrayBins = this.deserializeBinArray(accountInfo)
          binArrayBins.forEach((bin, binId) => {
            if (binIds.includes(binId)) {
              bins.set(binId, bin)
            }
          })
        }
      }
    } catch (error) {
      console.error('Error fetching bins:', error)
    }

    return bins
  }

  /**
   * Get bin array addresses for given bin IDs
   */
  private getBinArrayAddresses(
    lbPairPubkey: PublicKey,
    binIds: number[],
  ): PublicKey[] {
    const binArrayIndexes = new Set<number>()

    for (const binId of binIds) {
      const binArrayIndex = Math.floor(
        binId / METEORA_CONSTANTS.MAX_BIN_PER_ARRAY,
      )
      binArrayIndexes.add(binArrayIndex)
    }

    return Array.from(binArrayIndexes).map((index) =>
      this.deriveBinArrayAddress(lbPairPubkey, index),
    )
  }

  /**
   * Derive bin array PDA address
   */
  private deriveBinArrayAddress(
    lbPairPubkey: PublicKey,
    index: number,
  ): PublicKey {
    const indexBuffer = Buffer.alloc(8)
    indexBuffer.writeBigInt64LE(BigInt(index))

    const [binArrayPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('bin_array'), lbPairPubkey.toBuffer(), indexBuffer],
      config.meteoraProgramId,
    )

    return binArrayPda
  }

  /**
   * Deserialize bin array account data
   */
  private deserializeBinArray(
    accountInfo: AccountInfo<Buffer>,
  ): Map<number, Bin> {
    const bins = new Map<number, Bin>()
    const data = accountInfo.data

    let offset = 8 // Skip discriminator

    // Read bin array index
    const binArrayIndex = data.readBigInt64LE(offset)
    offset += 8

    // Read bins
    for (let i = 0; i < METEORA_CONSTANTS.MAX_BIN_PER_ARRAY; i++) {
      const binId =
        Number(binArrayIndex) * METEORA_CONSTANTS.MAX_BIN_PER_ARRAY + i

      // Read bin data (simplified structure)
      const reserveX = new BN(data.slice(offset, offset + 8), 'le')
      offset += 8

      const reserveY = new BN(data.slice(offset, offset + 8), 'le')
      offset += 8

      const liquiditySupply = new BN(data.slice(offset, offset + 8), 'le')
      offset += 8

      // Fee information
      const protocolFeeX = new BN(data.slice(offset, offset + 8), 'le')
      offset += 8

      const protocolFeeY = new BN(data.slice(offset, offset + 8), 'le')
      offset += 8

      const baseFeeRateX = new BN(data.slice(offset, offset + 8), 'le')
      offset += 8

      const baseFeeRateY = new BN(data.slice(offset, offset + 8), 'le')
      offset += 8

      // Only add non-empty bins
      if (
        !reserveX.isZero() ||
        !reserveY.isZero() ||
        !liquiditySupply.isZero()
      ) {
        bins.set(binId, {
          binId,
          price: 0, // Will be calculated separately
          reserveX,
          reserveY,
          liquiditySupply,
          feeInfos: {
            protocolFeeX,
            protocolFeeY,
            baseFeeRateX,
            baseFeeRateY,
          },
        })
      }
    }

    return bins
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
   * Calculate uncollected fees for a position
   */
  calculateUnCollectedFees(
    position: Position,
    bins: Map<number, Bin>,
  ): { tokenX: BN; tokenY: BN } {
    let totalFeeX = new BN(0)
    let totalFeeY = new BN(0)

    for (let i = 0; i < position.binIds.length; i++) {
      const binId = position.binIds[i]
      const liquidityShare = position.liquidityShares[i]
      const bin = bins.get(binId)

      if (bin && !liquidityShare.isZero()) {
        // Calculate accumulated fees based on liquidity share
        const shareRatio = liquidityShare
          .mul(new BN(1000000))
          .div(bin.liquiditySupply)

        const userFeeX = bin.feeInfos.baseFeeRateX
          .mul(shareRatio)
          .div(new BN(1000000))
        const userFeeY = bin.feeInfos.baseFeeRateY
          .mul(shareRatio)
          .div(new BN(1000000))

        totalFeeX = totalFeeX.add(userFeeX)
        totalFeeY = totalFeeY.add(userFeeY)
      }
    }

    // Add already owed fees
    totalFeeX = totalFeeX.add(position.feeOwed.tokenX)
    totalFeeY = totalFeeY.add(position.feeOwed.tokenY)

    return { tokenX: totalFeeX, tokenY: totalFeeY }
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
}
