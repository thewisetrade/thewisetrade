import type {
  TransactionSignature,
  TransactionDetails,
} from '../types/transaction.js'

import { Connection, PublicKey } from '@solana/web3.js'
import { config } from '../config/index.js'
import { retryWithBackoff, chunkArray } from '../utils/helpers.js'

let signaturesCache: TransactionSignature[] = []
let detailsCache = new Map<string, any>()

export class QuickNodeService {
  private connection: Connection
  private walletAddressString: string

  constructor(walletAddress: string) {
    this.walletAddressString = walletAddress
    this.connection = new Connection(config.quicknodeRpcUrl, 'confirmed')
    signaturesCache = JSON.parse(
      localStorage.getItem(`meteora-transactions-${walletAddress}`) || '[]',
    )
    // console.log('-> signatures cache, transactions loaded', signaturesCache.length)
    detailsCache = new Map<string, any>(
      Object.entries(
        JSON.parse(
          localStorage.getItem(`meteora-details-${walletAddress}`) || '[]',
        ),
      ),
    )
  }

  async getConnection(): Promise<Connection> {
    return this.connection
  }

  async getPastWeekTransactions(
    walletAddress: PublicKey,
  ): Promise<TransactionSignature[]> {
    let transactions = []
    console.log('signaturesCache', signaturesCache)
    if (signaturesCache.length === 0) {
      const now = Date.now()
      const daysBack = 7
      const cutoffTime = now - daysBack * 24 * 60 * 60 * 1000
      transactions = await this.getWalletTransactions(walletAddress, cutoffTime, undefined)
      //console.log('-> new transactions loaded', transactions.length)
    } else {
      const lastTransaction = signaturesCache[signaturesCache.length - 1]
      const lastSignature = lastTransaction ? lastTransaction.signature : undefined
      transactions = await this.getWalletTransactions(
        walletAddress,
        undefined,
        lastSignature,
      )
      // console.log('-> new transactions loaded after cache', transactions.length)
    }
    const allTransactions = signaturesCache.concat(transactions)
    signaturesCache = allTransactions
    localStorage.setItem(
      `meteora-transactions-${this.walletAddressString}`,
      JSON.stringify(allTransactions),
    )
    return allTransactions
  }

  /**
   * Get all transaction signatures for a wallet
   */
  async getWalletTransactions(
    walletAddress: PublicKey,
    cutoffTime: number | undefined,
    lastSignature: string | undefined,
  ): Promise<TransactionSignature[]> {
    const signatures: TransactionSignature[] = []

    let before: string | undefined
    let until: string | undefined
    let hasMore = true

    while (hasMore) {
      try {
        const result = await retryWithBackoff(async () => {
          if (lastSignature) {
            until = lastSignature
          }
          const params = {
            limit: 100,
            before,
            until,
          }
          return await this.connection.getSignaturesForAddress(
            walletAddress,
            params,
          )
        })

        if (result.length === 0) {
          hasMore = false
          break
        }

        for (const sig of result) {
          if (cutoffTime && sig.blockTime && sig.blockTime * 1000 < cutoffTime) {
            const date = new Date(sig.blockTime * 1000) // Convert to milliseconds
            hasMore = false
            break
          }

          if (sig.blockTime && sig.err === null) {
            signatures.push({
              signature: sig.signature,
              slot: sig.slot,
              blockTime: sig.blockTime,
              confirmationStatus: sig.confirmationStatus || 'confirmed',
            })
          }
        }
        before = result[result.length - 1]?.signature
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.error('Error fetching signatures:', error)
        break
      }
    }

    return signatures.reverse() // Return chronologically
  }

  /**
   * Get transaction details for multiple signatures
   */
  async getTransactionDetails(
    signatures: string[],
  ): Promise<TransactionDetails[]> {
    const transactions: TransactionDetails[] = []
    const signaturesToFetch: string[] = []

    signatures.forEach((signature) => {
      if (detailsCache.has(signature)) {
        transactions.push(detailsCache.get(signature))
      } else {
        signaturesToFetch.push(signature)
      }
    })
    // Process in chunks to avoid rate limits
    const chunks = chunkArray(signaturesToFetch, 100)

    let analyzedSignatures = 0
    for (const chunk of chunks) {
      console.log('chunk', chunks.length, analyzedSignatures)
      analyzedSignatures += chunk.length
      try {
        const startTime = performance.now()
        const results = await retryWithBackoff(async () => {
          return await this.connection.getParsedTransactions(chunk, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
          })
        })

        for (let i = 0; i < results.length; i++) {
          const tx = results[i]
          if (tx && tx.meta && tx.meta.err === null) {
            const txDetails = {
              signature: chunk[i],
              slot: tx.slot,
              blockTime: tx.blockTime || 0,
              transaction: {
                message: {
                  instructions: tx.transaction.message.instructions.map(
                    (ix: any) => ({
                      programId: new PublicKey(ix.programId),
                      parsed: ix.parsed,
                      accounts:
                        ix.accounts?.map((acc: string) => new PublicKey(acc)) ||
                        [],
                      data: ix.data || '',
                    }),
                  ),
                  accountKeys: tx.transaction.message.accountKeys.map(
                    (key: any) => new PublicKey(key.pubkey),
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
            }
            transactions.push(txDetails)
            if (!detailsCache.has(chunk[i])) {
              detailsCache.set(chunk[i], txDetails)
            }
          }
        }
        localStorage.setItem(
          `meteora-details-${this.walletAddressString}`,
          JSON.stringify(Object.fromEntries(detailsCache)),
        )

        // Rate limiting between chunks
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error fetching transaction details for chunk:`, error)
        throw error
      }
    }

    localStorage.setItem(
      `meteora-details-${this.walletAddressString}`,
      JSON.stringify(Object.fromEntries(detailsCache)),
    )

    return transactions
  }

  /**
   * Filter transactions that interact with Meteora DLMM program
   */
  filterMeteoraTransactions(
    transactions: TransactionDetails[],
  ): TransactionDetails[] {
    return transactions.filter((tx) =>
      tx.transaction.message.instructions.some((ix) => {
        return ix.programId === config.meteoraProgramId
      }),
    )
  }

  /**
   * Get account info for multiple addresses
   */
  async getMultipleAccountsInfo(addresses: PublicKey[]): Promise<any[]> {
    const chunks = chunkArray(addresses, 100)
    const results: any[] = []

    for (const chunk of chunks) {
      try {
        const accountInfos = await retryWithBackoff(async () => {
          return await this.connection.getMultipleAccountsInfo(chunk)
        })

        results.push(...accountInfos)

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.error('Error fetching account info:', error)
        // Push null for failed requests to maintain array length
        results.push(...new Array(chunk.length).fill(null))
      }
    }

    return results
  }

  /**
   * Get current slot
   */
  async getCurrentSlot(): Promise<number> {
    return await this.connection.getSlot()
  }

  /**
   * Get token supply information
   */
  async getTokenSupply(
    mint: PublicKey,
  ): Promise<{ amount: string; decimals: number; uiAmount: number }> {
    const response = await this.connection.getTokenSupply(mint)
    return {
      amount: response.value.amount,
      decimals: response.value.decimals,
      uiAmount: response.value.uiAmount || 0,
    }
  }

  /**
   * Subscribe to account changes (for real-time updates)
   */
  subscribeToAccount(
    accountId: PublicKey,
    callback: (accountInfo: any) => void,
  ): number {
    return this.connection.onAccountChange(accountId, callback)
  }

  /**
   * Unsubscribe from account changes
   */
  async unsubscribe(subscriptionId: number): Promise<void> {
    await this.connection.removeAccountChangeListener(subscriptionId)
  }
}
