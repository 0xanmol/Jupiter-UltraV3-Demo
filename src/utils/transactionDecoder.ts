import { VersionedTransaction, TransactionInstruction, PublicKey } from '@solana/web3.js';

export interface DecodedInstruction {
  programId: string;
  programName?: string;
  accounts: Array<{
    pubkey: string;
    isSigner: boolean;
    isWritable: boolean;
  }>;
  data: string;
}

export interface DecodedTransaction {
  instructions: DecodedInstruction[];
  signatures: string[];
  message: {
    header: {
      numRequiredSignatures: number;
      numReadonlySignedAccounts: number;
      numReadonlyUnsignedAccounts: number;
    };
    accountKeys: string[];
  };
}

// Known program IDs for better readability
const KNOWN_PROGRAMS: Record<string, string> = {
  '11111111111111111111111111111111': 'System Program',
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': 'Token Program',
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL': 'Associated Token Program',
  'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB': 'Jupiter V4',
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4': 'Jupiter V6',
  'JUP2jxvXaqu7NQY1GmNF4m1vodw12LVXYxbFL2uJvfo': 'Jupiter V6',
  'ComputeBudget111111111111111111111111111111': 'Compute Budget Program',
};

export function decodeTransaction(base64Transaction: string): DecodedTransaction | null {
  try {
    const transactionBuffer = Buffer.from(base64Transaction, 'base64');
    const transaction = VersionedTransaction.deserialize(transactionBuffer);
    
    const signatures = transaction.signatures.map(sig => sig.toString('base64'));
    
    const message = transaction.message;
    const accountKeys = message.staticAccountKeys.map(key => key.toBase58());
    
    const instructions: DecodedInstruction[] = message.compiledInstructions.map(ix => {
      const programId = accountKeys[ix.programIdIndex];
      const programName = KNOWN_PROGRAMS[programId] || 'Unknown Program';
      
      const accounts = ix.accountKeyIndexes.map(accountIndex => ({
        pubkey: accountKeys[accountIndex],
        isSigner: accountIndex < message.header.numRequiredSignatures,
        isWritable: accountIndex < message.header.numRequiredSignatures - message.header.numReadonlySignedAccounts ||
                   (accountIndex >= message.header.numRequiredSignatures && 
                    accountIndex < accountKeys.length - message.header.numReadonlyUnsignedAccounts)
      }));
      
      return {
        programId,
        programName,
        accounts,
        data: Buffer.from(ix.data).toString('hex')
      };
    });
    
    return {
      instructions,
      signatures,
      message: {
        header: {
          numRequiredSignatures: message.header.numRequiredSignatures,
          numReadonlySignedAccounts: message.header.numReadonlySignedAccounts,
          numReadonlyUnsignedAccounts: message.header.numReadonlyUnsignedAccounts,
        },
        accountKeys
      }
    };
  } catch (error) {
    console.error('Failed to decode transaction:', error);
    return null;
  }
}

export function formatAccountInfo(account: { pubkey: string; isSigner: boolean; isWritable: boolean }): string {
  const flags = [];
  if (account.isSigner) flags.push('Signer');
  if (account.isWritable) flags.push('Writable');
  
  return `${account.pubkey}${flags.length ? ` (${flags.join(', ')})` : ''}`;
}
