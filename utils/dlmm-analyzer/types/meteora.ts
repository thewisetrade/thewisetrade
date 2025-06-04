import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export interface MeteoraPool {
  pubkey: PublicKey;
  account: {
    tokenXMint: PublicKey;
    tokenYMint: PublicKey;
    binStep: number;
    baseFactorPpm: number;
    filterPeriod: number;
    decayPeriod: number;
    reductionFactor: number;
    variableFeeControl: number;
    maxVolatilityAccumulator: number;
    minBinId: number;
    maxBinId: number;
    protocolFee: number;
    lastUpdatedAt: BN;
    reserve: {
      tokenX: BN;
      tokenY: BN;
    };
  };
}

export interface Bin {
  binId: number;
  price: number;
  reserveX: BN;
  reserveY: BN;
  liquiditySupply: BN;
  feeInfos: {
    protocolFeeX: BN;
    protocolFeeY: BN;
    baseFeeRateX: BN;
    baseFeeRateY: BN;
  };
}

export interface LbPair {
  pubkey: PublicKey;
  tokenX: PublicKey;
  tokenY: PublicKey;
  binStep: number;
  reserveX: BN;
  reserveY: BN;
  activeId: number;
  bins: Map<number, Bin>;
}

// src/types/position.ts
export interface Position {
  pubkey: PublicKey;
  lbPair: PublicKey;
  owner: PublicKey;
  binIds: number[];
  liquidityShares: BN[];
  feeOwed: {
    tokenX: BN;
    tokenY: BN;
  };
  createdAt: Date;
  lastUpdatedAt: Date;
}

export interface PositionData {
  position: Position;
  currentValue: {
    tokenX: BN;
    tokenY: BN;
    totalUsd: number;
  };
  initialValue: {
    tokenX: BN;
    tokenY: BN;
    totalUsd: number;
  };
  collectedFees: {
    tokenX: BN;
    tokenY: BN;
    totalUsd: number;
  };
  unCollectedFees: {
    tokenX: BN;
    tokenY: BN;
    totalUsd: number;
  };
  upnl: {
    tokenX: BN;
    tokenY: BN;
    totalUsd: number;
    percentage: number;
  };
  priceRange: {
    minPrice: number;
    maxPrice: number;
    currentPrice: number;
  };
  age: {
    days: number;
    hours: number;
    minutes: number;
  };
  isInRange: boolean;
}

export interface PositionAnalysis {
  totalPositions: number;
  totalValue: number;
  totalPnl: number;
  totalCollectedFees: number;
  totalUnCollectedFees: number;
  avgAge: number;
  positions: PositionData[];
}
