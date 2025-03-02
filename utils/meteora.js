import { solanaWeb3 } from '@solana/web3.js'

const METEORA_PROGRAM_ID = new solanaWeb3.PublicKey('LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo');
const DLMM_POSITION_CREATION_INSTRUCTION = 'DLMM_POSITION_CREATION_INSTRUCTION_DATA';

const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'), 'confirmed');

async function listMeteoraDLMMTransactions(solanaWeb3, walletAddress) {
    let transactions = [];
    let signatures = [];
    let beforeSignature = null;

    // Calculate the timestamp for 7 days ago
    const now = Math.floor(Date.now() / 1000);
    const sevenDaysAgo = now - (7 * 24 * 60 * 60);

    do {
        const options = { limit: 1000, before: beforeSignature };
        const confirmedSignatures = await connection.getConfirmedSignaturesForAddress2(walletAddress, options);

        signatures = confirmedSignatures.map(sigInfo => sigInfo.signature);
        if (signatures.length === 0) {
            break;
        }

        beforeSignature = signatures[signatures.length - 1];

        const confirmedTransactions = await connection.getConfirmedTransactions(signatures);

        confirmedTransactions.forEach(tx => {
            if (tx && tx.transaction.message.programIds().includes(METEORA_PROGRAM_ID) && tx.blockTime >= sevenDaysAgo) {
                // Check for DLMM position creation instruction
                const instructions = tx.transaction.message.instructions;
                const dlmmPositionCreationFound = instructions.some(instr => {
                    const programId = tx.transaction.message.accountKeys[instr.programIdIndex];
                    const data = instr.data;
                    return programId.equals(METEORA_PROGRAM_ID)
                    // && data.startsWith(DLMM_POSITION_CREATION_INSTRUCTION);
                });

                if (dlmmPositionCreationFound) {
                    transactions.push(tx);
                }
            } else if (tx.blockTime <= sevenDaysAgo) {
              break;
            }
        });

    } while (signatures.length === 1000);

    return transactions;
}

listMeteoraDLMMTransactions(solanaWeb3, walletAddress)
  .then(transactions => {
    console.log(`Found ${transactions.length} DLMM position creation transactions in the last 7 days:`);
    transactions.forEach(tx => console.log(tx.transaction.signatures[0]));
  }).catch(err => {
      console.error('Error fetching transactions:', err);
  });
