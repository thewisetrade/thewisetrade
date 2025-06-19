import BN from 'bn.js'
import Decimal from 'decimal.js'

/**
 * Mathematical utilities for Meteora DLMM calculations
 */

/**
 * Calculate bin price from bin ID using the formula:
 * price = (1 + bin_step)^bin_id
 */
export function calculateBinPrice(binId: number, binStep: number): Decimal {
  const basisPointMax = 10000
  const binStepDecimal = new Decimal(binStep).div(basisPointMax)
  const onePlusBinStep = new Decimal(1).plus(binStepDecimal)
  return onePlusBinStep.pow(binId)
}

/**
 * Calculate bin ID from price
 */
export function calculateBinId(price: Decimal, binStep: number): number {
  const basisPointMax = 10000
  const binStepDecimal = new Decimal(binStep).div(basisPointMax)
  const onePlusBinStep = new Decimal(1).plus(binStepDecimal)
  return Math.floor(price.ln().div(onePlusBinStep.ln()).toNumber())
}

/**
 * Calculate liquidity distribution across bins
 */
export function calculateLiquidityDistribution(
  totalLiquidity: BN,
  binIds: number[],
  activeId: number,
  strategy: 'uniform' | 'spot' | 'curve' = 'uniform',
): BN[] {
  const distribution: BN[] = []

  switch (strategy) {
    case 'uniform':
      // Distribute equally across all bins
      const perBin = totalLiquidity.div(new BN(binIds.length))
      for (let i = 0; i < binIds.length; i++) {
        distribution.push(perBin)
      }
      break

    case 'spot':
      // Concentrate liquidity around active bin
      for (const binId of binIds) {
        const distance = Math.abs(binId - activeId)
        const weight = Math.max(1, 10 - distance) // Higher weight for closer bins
        const liquidity = totalLiquidity.mul(new BN(weight)).div(
          new BN(
            binIds.reduce((sum, id) => {
              const dist = Math.abs(id - activeId)
              return sum + Math.max(1, 10 - dist)
            }, 0),
          ),
        )
        distribution.push(liquidity)
      }
      break

    case 'curve':
      // Use normal distribution curve
      const sigma = 2 // Standard deviation
      const weights = binIds.map((binId) => {
        const distance = binId - activeId
        return Math.exp(-(distance * distance) / (2 * sigma * sigma))
      })
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)

      for (const weight of weights) {
        const liquidity = totalLiquidity
          .mul(new BN(Math.floor(weight * 1000000)))
          .div(new BN(Math.floor(totalWeight * 1000000)))
        distribution.push(liquidity)
      }
      break
  }

  return distribution
}

/**
 * Calculate impermanent loss
 */
export function calculateImpermanentLoss(
  initialPriceRatio: Decimal,
  currentPriceRatio: Decimal,
): Decimal {
  const priceChange = currentPriceRatio.div(initialPriceRatio)
  const sqrtPriceChange = priceChange.sqrt()

  // IL = 2 * sqrt(priceChange) / (1 + priceChange) - 1
  const il = new Decimal(2)
    .mul(sqrtPriceChange)
    .div(new Decimal(1).plus(priceChange))
    .minus(1)

  return il.abs()
}

/**
 * Calculate annual percentage yield (APY)
 */
export function calculateAPY(
  principal: Decimal,
  earned: Decimal,
  daysElapsed: number,
): Decimal {
  if (daysElapsed === 0 || principal.isZero()) {
    return new Decimal(0)
  }

  const dailyReturn = earned.div(principal)
  const annualizedReturn = dailyReturn.mul(365).div(daysElapsed)

  // Compound daily: (1 + daily_return)^365 - 1
  return new Decimal(1).plus(annualizedReturn.div(365)).pow(365).minus(1)
}

/**
 * Calculate fee APR
 */
export function calculateFeeAPR(
  totalFees: Decimal,
  liquidityValue: Decimal,
  daysElapsed: number,
): Decimal {
  if (daysElapsed === 0 || liquidityValue.isZero()) {
    return new Decimal(0)
  }

  const feeYield = totalFees.div(liquidityValue)
  return feeYield.mul(365).div(daysElapsed)
}

/**
 * Calculate position concentration ratio
 */
export function calculateConcentration(
  binIds: number[],
  binStep: number,
  totalRange?: { min: number; max: number },
): Decimal {
  if (binIds.length === 0) return new Decimal(0)

  const sortedBinIds = [...binIds].sort((a, b) => a - b)
  const minBinId = sortedBinIds[0]
  const maxBinId = sortedBinIds[sortedBinIds.length - 1]

  const positionRange = maxBinId - minBinId + 1

  if (totalRange) {
    const fullRange = totalRange.max - totalRange.min + 1
    return new Decimal(fullRange).div(positionRange)
  }

  // Default: compare to a "standard" range of 20 bins
  const standardRange = 20
  return new Decimal(standardRange).div(positionRange)
}

/**
 * Calculate volume-weighted average price (VWAP)
 */
export function calculateVWAP(prices: Decimal[], volumes: Decimal[]): Decimal {
  if (prices.length !== volumes.length || prices.length === 0) {
    return new Decimal(0)
  }

  let totalVolumePrice = new Decimal(0)
  let totalVolume = new Decimal(0)

  for (let i = 0; i < prices.length; i++) {
    const volumePrice = prices[i].mul(volumes[i])
    totalVolumePrice = totalVolumePrice.plus(volumePrice)
    totalVolume = totalVolume.plus(volumes[i])
  }

  return totalVolume.isZero()
    ? new Decimal(0)
    : totalVolumePrice.div(totalVolume)
}

/**
 * Calculate Sharpe ratio for position performance
 */
export function calculateSharpeRatio(
  returns: Decimal[],
  riskFreeRate: Decimal = new Decimal(0.02), // 2% annual risk-free rate
): Decimal {
  if (returns.length === 0) return new Decimal(0)

  const meanReturn = returns
    .reduce((sum, ret) => sum.plus(ret), new Decimal(0))
    .div(returns.length)
  const excessReturn = meanReturn.minus(riskFreeRate.div(365)) // Daily risk-free rate

  if (returns.length < 2) return new Decimal(0)

  // Calculate standard deviation
  const variance = returns
    .map((ret) => ret.minus(meanReturn).pow(2))
    .reduce((sum, sqDiff) => sum.plus(sqDiff), new Decimal(0))
    .div(returns.length - 1)

  const stdDev = variance.sqrt()

  return stdDev.isZero() ? new Decimal(0) : excessReturn.div(stdDev)
}

/**
 * Calculate maximum drawdown
 */
export function calculateMaxDrawdown(values: Decimal[]): Decimal {
  if (values.length === 0) return new Decimal(0)

  let maxDrawdown = new Decimal(0)
  let peak = values[0]

  for (const value of values) {
    if (value.gt(peak)) {
      peak = value
    } else {
      const drawdown = peak.minus(value).div(peak)
      if (drawdown.gt(maxDrawdown)) {
        maxDrawdown = drawdown
      }
    }
  }

  return maxDrawdown
}

/**
 * Calculate correlation between two price series
 */
export function calculateCorrelation(
  series1: Decimal[],
  series2: Decimal[],
): Decimal {
  if (series1.length !== series2.length || series1.length === 0) {
    return new Decimal(0)
  }

  const n = series1.length
  const mean1 = series1
    .reduce((sum, val) => sum.plus(val), new Decimal(0))
    .div(n)
  const mean2 = series2
    .reduce((sum, val) => sum.plus(val), new Decimal(0))
    .div(n)

  let numerator = new Decimal(0)
  let sumSq1 = new Decimal(0)
  let sumSq2 = new Decimal(0)

  for (let i = 0; i < n; i++) {
    const diff1 = series1[i].minus(mean1)
    const diff2 = series2[i].minus(mean2)

    numerator = numerator.plus(diff1.mul(diff2))
    sumSq1 = sumSq1.plus(diff1.pow(2))
    sumSq2 = sumSq2.plus(diff2.pow(2))
  }

  const denominator = sumSq1.sqrt().mul(sumSq2.sqrt())

  return denominator.isZero() ? new Decimal(0) : numerator.div(denominator)
}

/**
 * Calculate optimal bin range for a given price range and risk tolerance
 */
export function calculateOptimalBinRange(
  currentPrice: Decimal,
  expectedVolatility: Decimal,
  riskTolerance: Decimal,
  binStep: number,
): { minBinId: number; maxBinId: number } {
  // Calculate price range based on volatility and risk tolerance
  const priceMultiplier = expectedVolatility.mul(riskTolerance)
  const lowerPrice = currentPrice.mul(new Decimal(1).minus(priceMultiplier))
  const upperPrice = currentPrice.mul(new Decimal(1).plus(priceMultiplier))

  const currentBinId = calculateBinId(currentPrice, binStep)
  const minBinId = calculateBinId(lowerPrice, binStep)
  const maxBinId = calculateBinId(upperPrice, binStep)

  return { minBinId, maxBinId }
}

/**
 * BN utility functions
 */

/**
 * Convert BN to Decimal
 */
export function bnToDecimal(bn: BN, decimals: number = 0): Decimal {
  const divisor = new Decimal(10).pow(decimals)
  return new Decimal(bn.toString()).div(divisor)
}

/**
 * Convert Decimal to BN
 */
export function decimalToBN(decimal: Decimal, decimals: number = 0): BN {
  const multiplier = new Decimal(10).pow(decimals)
  const scaled = decimal.mul(multiplier)
  return new BN(scaled.floor().toString())
}

/**
 * Safe division for BN (returns 0 if divisor is 0)
 */
export function safeBNDiv(dividend: BN, divisor: BN): BN {
  if (divisor.isZero()) return new BN(0)
  return dividend.div(divisor)
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(
  initial: Decimal,
  current: Decimal,
): Decimal {
  if (initial.isZero()) return new Decimal(0)
  return current.minus(initial).div(initial).mul(100)
}

/**
 * Compound interest calculation
 */
export function calculateCompoundInterest(
  principal: Decimal,
  rate: Decimal,
  periods: number,
  compoundingFrequency: number = 365,
): Decimal {
  const ratePerPeriod = rate.div(compoundingFrequency)
  const totalPeriods = periods * compoundingFrequency

  return principal.mul(new Decimal(1).plus(ratePerPeriod).pow(totalPeriods))
}

/**
 * Calculate annualized return
 */
export function calculateAnnualizedReturn(
  initialValue: Decimal,
  finalValue: Decimal,
  daysHeld: number,
): Decimal {
  if (initialValue.isZero() || daysHeld === 0) return new Decimal(0)

  const totalReturn = finalValue.div(initialValue)
  const annualizationFactor = new Decimal(365).div(daysHeld)

  return totalReturn.pow(annualizationFactor).minus(1)
}
