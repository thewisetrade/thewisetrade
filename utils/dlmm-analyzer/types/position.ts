import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export interface Position {
  pubkey: PublicKey;
  lbPair: PublicKey;
  owner: PublicKey;
  // binIds: number[];
  // liquidityShares: BN[];
  // feeOwed: {
  //   tokenX: BN;
  //   tokenY: BN;
  // };
  createdAt: Date;
  lastUpdatedAt: Date;
}

export interface PositionData {
  position: Position;
  tokenX: PublicKey,
  tokenY: PublicKey,
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
  value: number;
  collectedFeesValue: number;
  unCollectedFeesValue: number;
  age: {
    days: number;
    hours: number;
    minutes: number;
  };
  isInRange: string | boolean;
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