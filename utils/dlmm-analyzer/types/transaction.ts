import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export interface TransactionSignature {
  signature: string;
  slot: number;
  blockTime: number;
  confirmationStatus: string;
}

export interface ParsedInstruction {
  programId: PublicKey;
  parsed?: any;
  accounts: PublicKey[];
  data: string;
}

export interface TransactionDetails {
  signature: string;
  slot: number;
  blockTime: number;
  transaction: {
    message: {
      instructions: ParsedInstruction[];
      accountKeys: PublicKey[];
    };
  };
  meta: {
    err: any;
    fee: number;
    preBalances: number[];
    postBalances: number[];
    logMessages: string[];
  };
}

export interface PositionOpenEvent {
  signature: string;
  blockTime: number;
  positionPubkey: PublicKey;
  lbPair: PublicKey;
  owner: PublicKey;
  binIds: number[];
  amounts: {
    tokenX: BN;
    tokenY: BN;
  };
}