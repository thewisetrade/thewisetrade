import BN from 'bn.js'

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function formatTokenAmount(amount: BN, decimals: number): string {
  const divisor = new BN(10).pow(new BN(decimals))
  const quotient = amount.div(divisor)
  const remainder = amount.mod(divisor)

  if (remainder.isZero()) {
    return quotient.toString()
  }

  const decimal = remainder.toString().padStart(decimals, '0')
  return `${quotient.toString()}.${decimal.replace(/0+$/, '')}`
}

export function calculateAge(createdAt: Date): {
  days: number
  hours: number
  minutes: number
} {
  const now = new Date()
  const diffMs = now.getTime() - createdAt.getTime()

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  return { days, hours, minutes }
}

export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries) {
        throw error
      }
      await sleep(baseDelay * Math.pow(2, i))
    }
  }
  // The loop always returns or throws on the last attempt; this only satisfies
  // the compiler.
  throw new Error('retryWithBackoff exhausted its retries')
}
