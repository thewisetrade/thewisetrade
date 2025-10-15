import type {
  TransactionSignature,
  TransactionDetails,
} from '../types/transaction.js'

import { Connection, PublicKey } from '@solana/web3.js'
import { config } from '../config/index.js'
import { retryWithBackoff, chunkArray } from '../utils/helpers.js'

let signaturesCache: TransactionSignature[] = []
let detailsCache = {}
let meteoraDetailsCache = {}

export class QuickNodeService {
  private connection: Connection
  private walletAddressString: string

  constructor(walletAddress: string) {
    this.walletAddressString = walletAddress
    this.connection = new Connection(config.quicknodeRpcUrl, 'confirmed')
    /*
    localStorage.setItem(`meteora-transactions-${walletAddress}`, '[]')
    localStorage.setItem(`meteora-details-${walletAddress}`, '{}')
    localStorage.setItem(`meteora-details-met-${walletAddress}`, '{}')
    */
    signaturesCache = JSON.parse(
      localStorage.getItem(`meteora-transactions-${walletAddress}`) || '[]'
    )
    detailsCache = JSON.parse(
      localStorage.getItem(`meteora-details-${walletAddress}`) || '{}'
    )
    meteoraDetailsCache = JSON.parse(
      localStorage.getItem(`meteora-details-met-${walletAddress}`) || '{}'
    )
  }

  async getConnection(): Promise<Connection> {
    return this.connection
  }

  async getPastWeekTransactions(
    walletAddress: PublicKey,
  ): Promise<TransactionSignature[]> {
    let transactions = []
    if (signaturesCache.length === 0) {
      const now = Date.now()
      const daysBack = 7
      const cutoffTime = now - daysBack * 24 * 60 * 60 * 1000
      transactions = await this.getWalletTransactions(
          walletAddress, cutoffTime, undefined
      )
    } else {
      const lastTransaction = signaturesCache[signaturesCache.length - 1]
      const lastSignature = lastTransaction ? lastTransaction.signature : undefined
      transactions = await this.getWalletTransactions(
        walletAddress,
        undefined,
        lastSignature,
      )
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
        if (lastSignature) {
          until = lastSignature
        }
        const params = {
          limit: 100,
          before,
          until,
        }
        const result = await this.connection.getSignaturesForAddress(
          walletAddress,
          params,
        )

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

    // we check all signatures
    signatures.forEach(signature => {
      // if the signatures was checked and identified as meteora transaction
      // we add it to the results.
      if (detailsCache[signature]) {
          if (meteoraDetailsCache[signature]) {
            transactions.push(meteoraDetailsCache[signature])
          }
      // If the signature was not there, we add it to the signature to analyze.
      } else {
        signaturesToFetch.push(signature)
      }
    })

    // Process in chunks to avoid rate limits
    const chunks = chunkArray(signaturesToFetch, 50)

    let analyzedSignaturesLength = 0
    for (const chunk of chunks) {
      analyzedSignaturesLength += chunk.length

      try {
        const startTime = performance.now()
        const results = await this.connection.getParsedTransactions(chunk, {
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0,
        })

        for (let i = 0; i < results.length; i++) {
          const tx = results[i]
          if (tx && tx.meta && tx.meta.err === null) {
            const txDetails = {
              signature: chunk[i],
              // slot: tx.slot,
              blockTime: tx.blockTime || 0,
              transaction: {
                message: {
                  instructions: tx.transaction.message.instructions.map(
                    (ix: any) => ({
                      programId: new PublicKey(ix.programId),
                      // parsed: ix.parsed,
                      accounts:
                         ix.accounts?.map((acc: string) => new PublicKey(acc)) ||
                        [],
                      // data: ix.data || '',
                    }),
                  ),
                  // accountKeys: tx.transaction.message.accountKeys.map(
                  //   (key: any) => new PublicKey(key.pubkey),
                  // ),
                },
              },
              meta: {
                // err: tx.meta.err,
                // fee: tx.meta.fee,
                // preBalances: tx.meta.preBalances,
                // postBalances: tx.meta.postBalances,
                logMessages: tx.meta.logMessages || [],
              },
            }
            if (!detailsCache[chunk[i]]) {
              detailsCache[chunk[i]] = true

              if (this.isMeteoraTransaction(txDetails)) {
                meteoraDetailsCache[chunk[i]] = txDetails
                transactions.push(txDetails)
              }
            }
          }

          localStorage.setItem(
            `meteora-details-${this.walletAddressString}`,
            JSON.stringify(detailsCache),
          )

          localStorage.setItem(
            `meteora-details-met-${this.walletAddressString}`,
            JSON.stringify(meteoraDetailsCache),
          )
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
        return transactions
      } catch (error) {
        console.error(`Error fetching transaction details for chunk:`, error)
        throw error
      }
    }

    localStorage.setItem(
      `meteora-details-${this.walletAddressString}`,
      JSON.stringify(detailsCache),
    )
    localStorage.setItem(
      `meteora-details-met-${this.walletAddressString}`,
      JSON.stringify(meteoraDetailsCache),
    )

    return transactions
  }

  isMeteoraTransaction(tx: TransactionDetails): boolean {
    return tx.transaction.message.instructions.some(ix => {
      const programId = ix.programId.toString()
      return programId === config.meteoraProgramId
    })
  }

  /**
   * Filter transactions that interact with Meteora DLMM program
   */
  filterMeteoraTransactions(
    transactions: TransactionDetails[],
  ): TransactionDetails[] {
    return transactions.filter(tx =>
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
