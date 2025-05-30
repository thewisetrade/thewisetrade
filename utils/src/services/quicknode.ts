import { Connection, PublicKey } from '@solana/web3.js';
import type { TransactionSignature, TransactionDetails } from '../types/transaction.js';
import { config } from '../config/index.js';
import { retryWithBackoff, chunkArray } from '../utils/helpers.js';

export class QuickNodeService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(config.quicknodeRpcUrl, 'confirmed');
  }

  async getConnection(): Promise<Connection> {
    return this.connection;
  }

  /**
   * Get all transaction signatures for a wallet in the last N days
   */
  async getWalletTransactions(
    walletAddress: PublicKey,
    daysBack: number = 1
  ): Promise<TransactionSignature[]> {
    console.log("🚀 ~ QuickNodeService ~ daysBack:", daysBack)
    
    const signatures: TransactionSignature[] = [];
    const now = Date.now();
    const cutoffTime = now - (daysBack * 24 * 60 * 60 * 1000);
    
    let before: string | undefined;
    let hasMore = true;

    while (hasMore) {
      try {
        const result = await retryWithBackoff(async () => {
          return await this.connection.getSignaturesForAddress(
            walletAddress,
            {
              limit: 1000,
              before,
            }
          );
        });

        if (result.length === 0) {
          hasMore = false;
          break;
        }

        for (const sig of result) {
          if (sig.blockTime && sig.blockTime * 1000 < cutoffTime) {
            hasMore = false;
            break;
          }

          if (sig.blockTime && sig.err === null) {
            signatures.push({
              signature: sig.signature,
              slot: sig.slot,
              blockTime: sig.blockTime,
              confirmationStatus: sig.confirmationStatus || 'confirmed',
            });
          }
        }

        before = result[result.length - 1]?.signature;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error('Error fetching signatures:', error);
        break;
      }
    }

    return signatures.reverse(); // Return chronologically
  }

  /**
   * Get transaction details for multiple signatures
   */
  async getTransactionDetails(
    signatures: string[]
  ): Promise<TransactionDetails[]> {
    const transactions: TransactionDetails[] = [];
    const chunks = chunkArray(signatures, 5); // Process in chunks to avoid rate limits

    for (const chunk of chunks) {
      try {
        const results = await retryWithBackoff(async () => {
          return await this.connection.getParsedTransactions(chunk, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
          });
        });

        for (let i = 0; i < results.length; i++) {
          const tx = results[i];
          if (tx && tx.meta && tx.meta.err === null) {
            transactions.push({
              signature: chunk[i],
              slot: tx.slot,
              blockTime: tx.blockTime || 0,
              transaction: {
                message: {
                  instructions: tx.transaction.message.instructions.map((ix: any) => ({
                    programId: new PublicKey(ix.programId),
                    parsed: ix.parsed,
                    accounts: ix.accounts?.map((acc: string) => new PublicKey(acc)) || [],
                    data: ix.data || '',
                  })),
                  accountKeys: tx.transaction.message.accountKeys.map((key: any) => 
                    new PublicKey(key.pubkey)
                  ),
                },
              },
              meta: {
                err: tx.meta.err,
                fee: tx.meta.fee,
                preBalances: tx.meta.preBalances,
                postBalances: tx.meta.postBalances,
                logMessages: tx.meta.logMessages || [],
              },
            });
          }
        }

        // Rate limiting between chunks
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`Error fetching transaction details for chunk:`, error);
      }
    }

    return transactions;
  }

  /**
   * Filter transactions that interact with Meteora DLMM program
   */
  filterMeteoraTransactions(transactions: TransactionDetails[]): TransactionDetails[] {
    return transactions.filter(tx => 
      tx.transaction.message.instructions.some(ix => 
        ix.programId.equals(config.meteoraProgramId)
      )
    );
  }

  /**
   * Get account info for multiple addresses
   */
  async getMultipleAccountsInfo(addresses: PublicKey[]): Promise<any[]> {
    const chunks = chunkArray(addresses, 100);
    const results: any[] = [];

    for (const chunk of chunks) {
      try {
        const accountInfos = await retryWithBackoff(async () => {
          return await this.connection.getMultipleAccountsInfo(chunk);
        });

        results.push(...accountInfos);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error fetching account info:', error);
        // Push null for failed requests to maintain array length
        results.push(...new Array(chunk.length).fill(null));
      }
    }

    return results;
  }

  /**
   * Get current slot
   */
  async getCurrentSlot(): Promise<number> {
    return await this.connection.getSlot();
  }

  /**
   * Get token supply information
   */
  async getTokenSupply(mint: PublicKey): Promise<{ amount: string; decimals: number; uiAmount: number }> {
    const response = await this.connection.getTokenSupply(mint);
    return {
      amount: response.value.amount,
      decimals: response.value.decimals,
      uiAmount: response.value.uiAmount || 0,
    };
  }

  /**
   * Subscribe to account changes (for real-time updates)
   */
  subscribeToAccount(
    accountId: PublicKey,
    callback: (accountInfo: any) => void
  ): number {
    return this.connection.onAccountChange(accountId, callback);
  }

  /**
   * Unsubscribe from account changes
   */
  async unsubscribe(subscriptionId: number): Promise<void> {
    await this.connection.removeAccountChangeListener(subscriptionId);
  }
}