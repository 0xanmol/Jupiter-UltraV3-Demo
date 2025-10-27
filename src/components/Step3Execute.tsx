'use client';

import { useState } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { VersionedTransaction } from '@solana/web3.js';
import { SwapConfig, OrderResponse, ExecuteResponse } from './SwapWizard';
import { ApiLogEntry } from '../hooks/useApiLogger';

interface Step3ExecuteProps {
  config: SwapConfig;
  order: OrderResponse;
  onComplete: (result: ExecuteResponse) => void;
  onError: (error: string) => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  addLog?: (entry: Omit<ApiLogEntry, 'id' | 'timestamp'>) => void;
}

const TOKENS = [
  {
    mint: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
  },
  {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  },
  {
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
  }
];

export function Step3Execute({ config, order, onComplete, onError, onBack, loading, setLoading, addLog }: Step3ExecuteProps) {
  const { signTransaction } = useWallet();
  const [executeResult, setExecuteResult] = useState<ExecuteResponse | null>(null);

  const getTokenByMint = (mint: string) => TOKENS.find(token => token.mint === mint);

  const executeSwap = async () => {
    if (!signTransaction) {
      onError('Wallet not connected');
      return;
    }

    setLoading(true);
    setExecuteResult(null);

    try {
      const transactionBuffer = Buffer.from(order.transaction, 'base64');
      const transaction = VersionedTransaction.deserialize(transactionBuffer);

      const signedTransaction = await signTransaction(transaction);
      const signedTransactionBase64 = Buffer.from(signedTransaction.serialize()).toString('base64');

      const requestBody = {
        signedTransaction: signedTransactionBase64,
        requestId: order.requestId,
      };

      const startTime = Date.now();
      
      const executeResponse = await fetch('https://api.jup.ag/ultra/v1/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_JUPITER_API_KEY || '',
        },
        body: JSON.stringify(requestBody),
      });

      const timing = Date.now() - startTime;
      const result = await executeResponse.json();

      addLog?.({
        method: 'POST',
        url: 'https://api.jup.ag/ultra/v1/execute',
        request: {
          headers: { 
            'Content-Type': 'application/json',
            'x-api-key': '***',
          },
          body: {
            signedTransaction: `${signedTransactionBase64.substring(0, 50)}...`,
            requestId: order.requestId,
          },
        },
        response: {
          status: executeResponse.status,
          statusText: executeResponse.statusText,
          data: result,
          error: !executeResponse.ok ? result.error : undefined,
          timing,
        },
      });

      if (!executeResponse.ok) {
        throw new Error(result.error || `HTTP ${executeResponse.status}`);
      }
      
      // Add a small delay before showing success to make the transition smoother
      setTimeout(() => {
        setExecuteResult(result);
        onComplete(result);
      }, 500);
    } catch (error) {
      console.error('Execute error:', error);
      onError(error instanceof Error ? error.message : 'Failed to execute swap');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, decimals: number) => {
    return (amount / Math.pow(10, decimals)).toFixed(6);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-6">Execute Swap</h2>
      
      {/* Swap Summary */}
      <div className="mb-6 space-y-3 border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="text-white font-semibold">{config.amount} {getTokenByMint(config.inputMint)?.symbol}</div>
          <div className="text-gray-500">→</div>
          <div className="text-white font-semibold">
            {order.outAmount ? formatAmount(order.outAmount, getTokenByMint(config.outputMint)?.decimals || 6) : '...'} {getTokenByMint(config.outputMint)?.symbol}
          </div>
        </div>
        <div className="text-xs text-gray-500 font-mono border-t border-gray-800 pt-3">
          {order.requestId.slice(0, 16)}
        </div>
        {order.swapType && (
          <div className="flex items-center justify-between border-t border-gray-800 pt-3">
            <span className="text-gray-500 text-sm">Router</span>
            <span className="text-green-400 font-semibold">{order.swapType}</span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {executeResult && executeResult.error && (
        <div className="mb-6 border border-red-500/30 rounded-lg p-4 bg-gray-900">
          <div className="text-sm text-red-500">{executeResult.error}</div>
        </div>
      )}

      {/* Action Buttons */}
      {!executeResult && (
        <div className="flex space-x-4">
          <button
            onClick={onBack}
            disabled={loading}
            className="flex-1 bg-gray-800 border border-gray-700 hover:bg-gray-750 disabled:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Back
          </button>
          
          <button
            onClick={executeSwap}
            disabled={loading}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Executing...' : 'Execute Swap'}
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
          <p className="text-gray-500 mt-2">Executing...</p>
        </div>
      )}
    </div>
  );
}
