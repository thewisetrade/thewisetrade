
// examples/basic-usage.ts
import { PublicKey } from '@solana/web3.js';
import { QuickNodeService, MeteoraService, PositionAnalyzer } from '../src/index.js';

export async function basicExample() {
  // Initialize services
  const quickNodeService = new QuickNodeService();
  const meteoraService = new MeteoraService(quickNodeService);
  const positionAnalyzer = new PositionAnalyzer(quickNodeService, meteoraService);

  // Analyze specific wallet
  const walletAddress = new PublicKey(import.meta.env.VITE_WALLET_ADDRESS);
 console.log("wallet tracking:::",  import.meta.env.VITE_WALLET_ADDRESS);
  
  const transactions = await quickNodeService.getWalletTransactions(walletAddress, 7);
  const details = await quickNodeService.getTransactionDetails(
    transactions.map(tx => tx.signature)
  );
  const meteoraTransactions = quickNodeService.filterMeteoraTransactions(details);
  const positionEvents = meteoraService.parsePositionOpenEvents(meteoraTransactions);
  
  const analysis = await positionAnalyzer.analyzePositions(positionEvents);
  console.log('Analysis:', analysis);
  return analysis;
}
