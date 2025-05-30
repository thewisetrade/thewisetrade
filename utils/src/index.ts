// src/index.ts
import { PublicKey } from '@solana/web3.js';
import { QuickNodeService } from './services/quicknode.js';
import { MeteoraService } from './services/meteora.js';
import { PositionAnalyzer } from './services/position-analyzer.js';
import { config } from './config/index.js';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('🚀 Starting Meteora DLMM Position Analyzer...\n');

  try {
    // Initialize services
    const quickNodeService = new QuickNodeService();
    const meteoraService = new MeteoraService(quickNodeService);
    const positionAnalyzer = new PositionAnalyzer(quickNodeService, meteoraService);

    console.log(`📊 Analyzing wallet: ${config.walletAddress.toBase58()}`);
    console.log(`📅 Looking back ${config.daysToLookBack} days\n`);

    // Step 1: Get wallet transactions
    console.log('🔍 Fetching wallet transactions...');
    const transactions = await quickNodeService.getWalletTransactions(
      config.walletAddress,
      config.daysToLookBack
    );
    console.log(`✅ Found ${transactions.length} transactions\n`);

    if (transactions.length === 0) {
      console.log('❌ No transactions found for the specified period');
      return;
    }

    // Step 2: Get transaction details
    console.log('📋 Fetching transaction details...');
    const transactionDetails = await quickNodeService.getTransactionDetails(
      transactions.map(tx => tx.signature)
    );
    console.log(`✅ Retrieved ${transactionDetails.length} transaction details\n`);

    // Step 3: Filter Meteora transactions
    console.log('🔎 Filtering Meteora DLMM transactions...');
    const meteoraTransactions = quickNodeService.filterMeteoraTransactions(transactionDetails);
    console.log(`✅ Found ${meteoraTransactions.length} Meteora transactions\n`);

    if (meteoraTransactions.length === 0) {
      console.log('❌ No Meteora DLMM transactions found');
      return;
    }

    // Step 4: Parse position open events
    console.log('🏗️  Parsing position open events...');
    const positionEvents = meteoraService.parsePositionOpenEvents(meteoraTransactions);
    console.log(`✅ Found ${positionEvents.length} position open events\n`);

    if (positionEvents.length === 0) {
      console.log('❌ No position open events found');
      return;
    }

    // Step 5: Get token prices
    console.log('💰 Fetching token prices...');
    const uniqueTokenMints = new Set<string>();
    
    for (const event of positionEvents) {
      try {
        const lbPair = await meteoraService.fetchLbPair(event.lbPair);
        if (lbPair) {
          uniqueTokenMints.add(lbPair.tokenX.toBase58());
          uniqueTokenMints.add(lbPair.tokenY.toBase58());
        }
      } catch (error) {
        console.warn(`Could not fetch LB pair for ${event.lbPair.toBase58()}`);
      }
    }

    const tokenMints = Array.from(uniqueTokenMints).map(mint => new PublicKey(mint));
    const priceData = await positionAnalyzer.getTokenPrices(tokenMints);
    console.log("🚀 ~ main ~ priceData:", priceData)
    
    console.log(`✅ Retrieved prices for ${priceData.size} tokens\n`);

    // Step 6: Analyze positions
    console.log('🔬 Analyzing positions...');
    const analysis = await positionAnalyzer.analyzePositions(positionEvents, priceData);
    console.log(`✅ Analysis complete!\n`);

    return analysis;

    // // Step 7: Generate and display report
    // console.log('📄 Generating report...\n');
    // const report = positionAnalyzer.generateReport(analysis);
    // console.log(report);

    // // Step 8: Save results to files
    // const outputDir = 'output';
    // if (!fs.existsSync(outputDir)) {
    //   fs.mkdirSync(outputDir);
    // }

    // // Save detailed JSON data
    // const jsonData = positionAnalyzer.exportToJson(analysis);
    // const jsonPath = path.join(outputDir, `meteora-analysis-${Date.now()}.json`);
    // fs.writeFileSync(jsonPath, jsonData);
    // console.log(`\n💾 Detailed data saved to: ${jsonPath}`);

    // // Save human-readable report
    // const reportPath = path.join(outputDir, `meteora-report-${Date.now()}.txt`);
    // fs.writeFileSync(reportPath, report);
    // console.log(`📄 Report saved to: ${reportPath}`);

    // // Save CSV summary
    // // const csvData = generateCSVSummary(analysis);
    // // const csvPath = path.join(outputDir, `meteora-summary-${Date.now()}.csv`);
    // // fs.writeFileSync(csvPath, csvData);
    // // console.log(`📊 CSV summary saved to: ${csvPath}`);

    // console.log('\n🎉 Analysis completed successfully!');

  } catch (error) {
    console.error('❌ Error during analysis:', error);
    return null;
    //process.exit(1);
  }
}

/**
 * Generate CSV summary of positions
 */
// function generateCSVSummary(analysis: any): string {
//   const headers = [
//     'Position Address',
//     'LB Pair',
//     'Age (Days)',
//     'Current Value (USD)',
//     'Initial Value (USD)',
//     'PnL (USD)',
//     'PnL (%)',
//     'Collected Fees (USD)',
//     'Uncollected Fees (USD)',
//     'Min Price',
//     'Max Price',
//     'Current Price',
//     'In Range',
//     'Bin Count',
//     'Bin IDs'
//   ];

//   const rows = analysis.positions.map((pos: any) => [
//     pos.position.pubkey,
//     pos.position.lbPair,
//     pos.age.days.toFixed(1),
//     pos.currentValue.totalUsd.toFixed(2),
//     pos.initialValue.totalUsd.toFixed(2),
//     pos.upnl.totalUsd.toFixed(2),
//     pos.upnl.percentage.toFixed(2),
//     pos.collectedFees.totalUsd.toFixed(2),
//     pos.unCollectedFees.totalUsd.toFixed(2),
//     pos.priceRange.minPrice.toFixed(6),
//     pos.priceRange.maxPrice.toFixed(6),
//     pos.priceRange.currentPrice.toFixed(6),
//     //pos.isInRange ? 'Yes' : 'No',
//    // pos.position.binIds.length,
//    // `"[${pos.position.binIds.join(', ')}]"`
//   ]);

//   return [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');
// }

/**
 * CLI argument parser
 */
// function parseArguments(): Partial<typeof config> {
//   const args = import.meta.argv.slice(2);
//   const parsedConfig: any = {};

//   for (let i = 0; i < args.length; i += 2) {
//     const flag = args[i];
//     const value = args[i + 1];

//     switch (flag) {
//       case '--wallet':
//       case '-w':
//         if (value) parsedConfig.walletAddress = new PublicKey(value);
//         break;
//       case '--days':
//       case '-d':
//         if (value) parsedConfig.daysToLookBack = parseInt(value);
//         break;
//       case '--rpc':
//       case '-r':
//         if (value) parsedConfig.quicknodeRpcUrl = value;
//         break;
//       case '--help':
//       case '-h':
//         showHelp();
//         process.exit(0);
//         break;
//     }
//   }

//   return parsedConfig;
// }

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Meteora DLMM Position Analyzer

Usage: npm run dev [options]

Options:
  -w, --wallet <address>    Wallet address to analyze
  -d, --days <number>       Number of days to look back (default: 7)
  -r, --rpc <url>          QuickNode RPC URL
  -h, --help               Show this help message

Examples:
  npm run dev --wallet YOUR_WALLET_ADDRESS --days 14
  npm run dev -w YOUR_WALLET_ADDRESS -d 30 -r YOUR_RPC_URL

Environment Variables:
  QUICKNODE_RPC_URL        Your QuickNode RPC endpoint
  WALLET_ADDRESS           Wallet address to analyze
  METEORA_PROGRAM_ID       Meteora program ID (default: LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo)
`);
}

// Handle CLI arguments
//const cliConfig = parseArguments();
Object.assign(config);

// Validate required configuration
if (!config.quicknodeRpcUrl) {
  console.error('❌ QuickNode RPC URL is required. Set QUICKNODE_RPC_URL environment variable or use --rpc flag.');
  process.exit(1);
}

if (!config.walletAddress) {
  console.error('❌ Wallet address is required. Set WALLET_ADDRESS environment variable or use --wallet flag.');
  process.exit(1);
}

// Start the analysis
// if (require.main === module) {
//   main().catch(console.error);
// }

export { main, QuickNodeService, MeteoraService, PositionAnalyzer };