export const config = {
  quicknodeRpcUrl: import.meta.env.VITE_RPC_ENDPOINT_URL || '',
  meteoraProgramId:
    import.meta.env.VITE_METEORA_PROGRAM_ID ||
      'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo',
  daysToLookBack: 2,
  maxTransactions: 1000,
}
