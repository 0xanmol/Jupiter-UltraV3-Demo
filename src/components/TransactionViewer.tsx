'use client';

import { useState } from 'react';
import { decodeTransaction, DecodedTransaction, formatAccountInfo } from '../utils/transactionDecoder';

interface TransactionViewerProps {
  base64Transaction: string;
  className?: string;
}

export function TransactionViewer({ base64Transaction, className = '' }: TransactionViewerProps) {
  const [decodedTx, setDecodedTx] = useState<DecodedTransaction | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDecode = async () => {
    setIsDecoding(true);
    setError(null);
    
    try {
      const decoded = decodeTransaction(base64Transaction);
      if (decoded) {
        setDecodedTx(decoded);
      } else {
        setError('Failed to decode transaction');
      }
    } catch (err) {
      setError('Error decoding transaction');
      console.error('Decode error:', err);
    } finally {
      setIsDecoding(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className={`bg-gray-900 rounded-lg ${className}`}>
      <div className="px-3 py-2 border-b border-gray-800 flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">Transaction Decoder</h4>
        <button
          onClick={handleDecode}
          disabled={isDecoding}
          className="text-xs text-green-500 hover:text-green-400 transition-colors disabled:opacity-50"
        >
          {isDecoding ? 'Decoding...' : 'Decode Transaction'}
        </button>
      </div>
      
      <div className="p-3">
        {error && (
          <div className="text-red-400 text-sm mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded">
            {error}
          </div>
        )}
        
        {decodedTx && (
          <div className="space-y-4">
            {/* Transaction Header */}
            <div>
              <h5 className="text-xs text-gray-500 uppercase mb-2">Transaction Info</h5>
              <div className="bg-gray-800 rounded p-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400">Required Signatures:</span>
                    <span className="text-white ml-2">{decodedTx.message.header.numRequiredSignatures}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Readonly Signed:</span>
                    <span className="text-white ml-2">{decodedTx.message.header.numReadonlySignedAccounts}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Readonly Unsigned:</span>
                    <span className="text-white ml-2">{decodedTx.message.header.numReadonlyUnsignedAccounts}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Accounts:</span>
                    <span className="text-white ml-2">{decodedTx.message.accountKeys.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h5 className="text-xs text-gray-500 uppercase mb-2">Instructions ({decodedTx.instructions.length})</h5>
              <div className="space-y-2">
                {decodedTx.instructions.map((ix, index) => (
                  <div key={index} className="bg-gray-800 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">#{index + 1}</span>
                        <span className="text-sm font-medium text-white">{ix.programName}</span>
                        <span className="text-xs text-gray-500">({ix.programId})</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(ix.programId)}
                        className="text-xs text-gray-500 hover:text-green-400 transition-colors"
                        title="Copy Program ID"
                      >
                        📋
                      </button>
                    </div>
                    
                    <div className="text-xs">
                      <div className="text-gray-400 mb-1">Accounts ({ix.accounts.length}):</div>
                      <div className="space-y-1 ml-2">
                        {ix.accounts.map((account, accIndex) => (
                          <div key={accIndex} className="flex items-center justify-between">
                            <span className="text-gray-300">{formatAccountInfo(account)}</span>
                            <button
                              onClick={() => copyToClipboard(account.pubkey)}
                              className="text-xs text-gray-500 hover:text-green-400 transition-colors opacity-0 group-hover:opacity-100"
                              title="Copy Account"
                            >
                              📋
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {ix.data && (
                      <div className="mt-2 text-xs">
                        <div className="text-gray-400 mb-1">Data:</div>
                        <div className="bg-gray-700 rounded p-2 font-mono text-gray-300 break-all">
                          {ix.data}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Signatures */}
            <div>
              <h5 className="text-xs text-gray-500 uppercase mb-2">Signatures ({decodedTx.signatures.length})</h5>
              <div className="space-y-1">
                {decodedTx.signatures.map((sig, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-800 rounded p-2">
                    <span className="text-xs text-gray-300 font-mono">{sig}</span>
                    <button
                      onClick={() => copyToClipboard(sig)}
                      className="text-xs text-gray-500 hover:text-green-400 transition-colors"
                      title="Copy Signature"
                    >
                      📋
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
