import axios from 'axios';
import { MeteoraService, PositionAnalyzer, QuickNodeService } from '../src';
import { PublicKey } from '@solana/web3.js';

async function priceIntegrationExample() {
  // Example integration with Jupiter API for real-time prices
  async function getJupiterPrice(mintAddress: string): Promise<number> {
    try {
      const response = await axios.get(
        `https://price.jup.ag/v4/price?ids=${mintAddress}`
      );
      return response.data.data[mintAddress]?.price || 0;
    } catch (error) {
      console.error('Error fetching Jupiter price:', error);
      return 0;
    }
  }

  // Example integration with Birdeye API
  async function getBirdeyePrice(mintAddress: string): Promise<number> {
    try {
      const response = await axios.get(
        `https://public-api.birdeye.so/defi/price?address=${mintAddress}`,
        {
          headers: {
            'X-API-KEY': 'YOUR_BIRDEYE_API_KEY'
          }
        }
      );
      return response.data.data?.value || 0;
    } catch (error) {
      console.error('Error fetching Birdeye price:', error);
      return 0;
    }
  }

  // Enhanced position analyzer with real-time prices
  class EnhancedPositionAnalyzer extends PositionAnalyzer {
    async getTokenPrices(tokenMints: PublicKey[]): Promise<Map<string, number>> {
      const prices = new Map<string, number>();
      
      for (const mint of tokenMints) {
        const mintStr = mint.toBase58();
        
        // Try Jupiter first, fallback to Birdeye
        let price = await getJupiterPrice(mintStr);
        if (price === 0) {
          price = await getBirdeyePrice(mintStr);
        }
        
        prices.set(mintStr, price);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      return prices;
    }
  }

  // Usage
  const quickNodeService = new QuickNodeService();
  const meteoraService = new MeteoraService(quickNodeService);
  const enhancedAnalyzer = new EnhancedPositionAnalyzer(quickNodeService, meteoraService);

  // This will now use real-time prices
  const walletAddress = new PublicKey('YOUR_WALLET_ADDRESS');
  // ... rest of analysis code
}

export {
  basicExample,
  advancedAnalysisExample,
  realTimeMonitoringExample,
  batchAnalysisExample,
  customStrategyExample,
  priceIntegrationExample
};