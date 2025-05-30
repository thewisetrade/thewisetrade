import { PublicKey } from '@solana/web3.js';
//import dotenv from 'dotenv';

//dotenv.config();

export const config = {
  quicknodeRpcUrl:  import.meta.env.VITE_RPC_ENDPOINT_URL || '',
  walletAddress: new PublicKey(import.meta.env.VITE_WALLET_ADDRESS || ''),
  meteoraProgramId: new PublicKey(import.meta.env.VITE_METEORA_PROGRAM_ID || 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo'),
  daysToLookBack: 1,
  maxTransactions: 1000,
};