import { PublicKey } from "@solana/web3.js";
import { MeteoraService, PositionAnalyzer, QuickNodeService } from "../src/index.js";

async function batchAnalysisExample() {
    const quickNodeService = new QuickNodeService();
    const meteoraService = new MeteoraService(quickNodeService);
    const positionAnalyzer = new PositionAnalyzer(quickNodeService, meteoraService);

    // Analyze multiple wallets
    const wallets = [
        'WALLET_1',
        'WALLET_2',
        'WALLET_3'
    ].map(addr => new PublicKey(addr));

    const allAnalyses: any = [];

    for (const wallet of wallets) {
        console.log(`Analyzing wallet: ${wallet.toBase58()}`);

        try {
            const transactions = await quickNodeService.getWalletTransactions(wallet, 2);
            const details = await quickNodeService.getTransactionDetails(
                transactions.map(tx => tx.signature)
            );
            const meteoraTransactions = quickNodeService.filterMeteoraTransactions(details);
            const positionEvents = meteoraService.parsePositionOpenEvents(meteoraTransactions);
            const analysis = await positionAnalyzer.analyzePositions(positionEvents);

            allAnalyses.push({
                wallet: wallet.toBase58(),
                analysis
            });
        } catch (error) {
            console.error(`Error analyzing wallet ${wallet.toBase58()}:`, error);
        }
    }

    // Generate comparative report
    console.log('\n=== COMPARATIVE ANALYSIS ===');
    for (const { wallet, analysis } of allAnalyses) {
        console.log(`\nWallet: ${wallet.slice(0, 8)}...`);
        console.log(`  Total Positions: ${analysis.totalPositions}`);
        console.log(`  Total Value: $${analysis.totalValue.toLocaleString()}`);
        console.log(`  Total PnL: $${analysis.totalPnl.toLocaleString()}`);
        console.log(`  Average Age: ${analysis.avgAge.toFixed(1)} days`);
    }
}