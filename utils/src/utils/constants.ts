import { PublicKey } from '@solana/web3.js';

export const METEORA_CONSTANTS = {
  PROGRAM_ID: new PublicKey('LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo'),
  BASIS_POINT_MAX: 10000,
  BIN_ARRAY_BITMAP_SIZE: 512,
  MAX_BIN_PER_ARRAY: 70,
  MAX_BIN_PER_POSITION: 70,
  FEE_PRECISION: 1000000,
  PRICE_PRECISION: 24,
} as const;

export const INSTRUCTION_NAMES = {
  ADD_LIQUIDITY: 'addLiquidity',
  ADD_LIQUIDITY_BY_WEIGHT: 'addLiquidityByWeight',
  ADD_LIQUIDITY_BY_STRATEGY: 'addLiquidityByStrategy',
  REMOVE_LIQUIDITY: 'removeLiquidity',
  SWAP: 'swap',
  INITIALIZE_POSITION: 'initializePosition',
  CLOSE_POSITION: 'closePosition',
} as const;

export const TOKEN_PROGRAM_IDS = {
  TOKEN_PROGRAM: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  TOKEN_2022_PROGRAM: new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'),
  ASSOCIATED_TOKEN_PROGRAM: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
} as const;

export const WELL_KNOWN_TOKENS = {
  SOL: new PublicKey('So11111111111111111111111111111111111111112'),
  USDC: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
  USDT: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
  BONK: new PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'),
  WIF: new PublicKey('EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm'),
} as const;
