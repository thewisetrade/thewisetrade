import { PublicKey } from '@solana/web3.js';
import { MeteoraService, PositionAnalyzer, QuickNodeService } from '../src/index.js';
import { calculateAPY, calculateImpermanentLoss } from '../src/utils/math.js';
import Decimal from 'decimal.js';

async function advancedAnalysisExample() {
  const quickNodeService = new QuickNodeService();
  const meteoraService = new MeteoraService(quickNodeService);
  const positionAnalyzer = new PositionAnalyzer(quickNodeService, meteoraService);

  // Get position data
  const walletAddress = new PublicKey('YOUR_WALLET_ADDRESS');
  const transactions = await quickNodeService.getWalletTransactions(walletAddress, 30);
  const details = await quickNodeService.getTransactionDetails(
    transactions.map(tx => tx.signature)
  );
  const meteoraTransactions = quickNodeService.filterMeteoraTransactions(details);
  const positionEvents = meteoraService.parsePositionOpenEvents(meteoraTransactions);
  const analysis = await positionAnalyzer.analyzePositions(positionEvents);

  // Advanced calculations
  for (const position of analysis.positions) {
    // Calculate APY from fees
    const feesEarned = new Decimal(position.collectedFees.totalUsd + position.unCollectedFees.totalUsd);
    const principal = new Decimal(position.initialValue.totalUsd);
    const apy = calculateAPY(principal, feesEarned, position.age.days);
    
    console.log(`Position ${position.position.pubkey.toBase58().slice(0, 8)}...`);
    console.log(`  APY from fees: ${apy.mul(100).toFixed(2)}%`);
    
    // Calculate impermanent loss (simplified)
    const initialPrice = new Decimal(1); // Assume initial price ratio was 1:1
    const currentPrice = new Decimal(position.priceRange.currentPrice);
    const il = calculateImpermanentLoss(initialPrice, currentPrice);
    console.log(`  Impermanent Loss: ${il.mul(100).toFixed(2)}%`);
  }
}