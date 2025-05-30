import { Decimal } from 'decimal.js';
import { MeteoraService, QuickNodeService } from '../src';
import { calculateLiquidityDistribution, calculateOptimalBinRange } from '../src/utils/math';
import BN from 'bn.js';

async function customStrategyExample() {
  const meteoraService = new MeteoraService(new QuickNodeService());

  // Example: Calculate optimal bin range for SOL/USDC pair
  const currentPrice = new Decimal(100); // $100 SOL
  const expectedVolatility = new Decimal(0.5); // 50% volatility
  const riskTolerance = new Decimal(0.2); // 20% price movement tolerance
  const binStep = 25; // 0.25% bin step

  const optimalRange = calculateOptimalBinRange(
    currentPrice,
    expectedVolatility,
    riskTolerance,
    binStep
  );

  console.log('Optimal bin range:');
  console.log(`  Min Bin ID: ${optimalRange.minBinId}`);
  console.log(`  Max Bin ID: ${optimalRange.maxBinId}`);

  // Calculate liquidity distribution
  const totalLiquidity = new BN('1000000000'); // 1B units
  const binIds = Array.from(
    { length: optimalRange.maxBinId - optimalRange.minBinId + 1 },
    (_, i) => optimalRange.minBinId + i
  );
  const activeId = Math.floor((optimalRange.minBinId + optimalRange.maxBinId) / 2);

  const distribution = calculateLiquidityDistribution(
    totalLiquidity,
    binIds,
    activeId,
    'curve' // Use normal distribution curve
  );

  console.log('\nLiquidity distribution (curve strategy):');
  binIds.forEach((binId, index) => {
    const price = meteoraService.calculateBinPrice(binId, binStep);
    console.log(`  Bin ${binId}: ${distribution[index].toString()} units @ $${price.toFixed(6)}`);
  });
}