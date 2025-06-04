import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import Decimal from 'decimal.js';

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatTokenAmount(amount: BN, decimals: number): string {
  const divisor = new BN(10).pow(new BN(decimals));
  const quotient = amount.div(divisor);
  const remainder = amount.mod(divisor);
  
  if (remainder.isZero()) {
    return quotient.toString();
  }
  
  const decimal = remainder.toString().padStart(decimals, '0');
  return `${quotient.toString()}.${decimal.replace(/0+$/, '')}`;
}

export function parseTokenAmount(amount: string, decimals: number): BN {
  const [whole, decimal = ''] = amount.split('.');
  const paddedDecimal = decimal.padEnd(decimals, '0').slice(0, decimals);
  return new BN(whole).mul(new BN(10).pow(new BN(decimals))).add(new BN(paddedDecimal));
}

export function calculateAge(createdAt: Date): { days: number; hours: number; minutes: number } {
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return { days, hours, minutes };
}

export function isValidPublicKey(key: string): boolean {
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
}

export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const result = await fn();
        resolve(result);
        return;
      } catch (error) {
        if (i === maxRetries) {
          reject(error);
          return;
        }
        const delay = baseDelay * Math.pow(2, i);
        await sleep(delay);
      }
    }
  });
}