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
      
      // Extract executed amounts if available (may be in different fields)
      const executeResponseData: ExecuteResponse = {
        status: result.status || 'Success',
        signature: result.signature,
        error: result.error,
        outAmount: result.outAmount || result.executedOutAmount,
        inAmount: result.inAmount || result.executedInAmount,
        executedOutAmount: result.executedOutAmount || result.outAmount,
        executedInAmount: result.executedInAmount || result.inAmount,
      };
      
      // Add a small delay before showing success to make the transition smoother
      setTimeout(() => {
        setExecuteResult(executeResponseData);
        onComplete(executeResponseData);
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
        
        {/* Protection Badge */}
        <div className="flex items-center gap-2 border-t border-gray-800 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-green-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>MEV Protected</span>
          </div>
        </div>
        
        {/* Slippage Protection */}
        {order.slippageBps !== undefined && order.slippageBps !== null && (
          <div className="flex items-center justify-between border-t border-gray-800 pt-3">
            <span className="text-gray-500 text-sm">Slippage Protection</span>
            <span className="text-green-400 font-semibold">{(Number(order.slippageBps) / 100).toFixed(2)}%</span>
          </div>
        )}
        
        {/* Price Impact */}
        {order.priceImpactPct !== undefined && order.priceImpactPct !== null && (
          <div className="flex items-center justify-between border-t border-gray-800 pt-3">
            <span className="text-gray-500 text-sm">Price Impact</span>
            <span className={`font-semibold ${
              Number(order.priceImpactPct) < 1 ? 'text-green-400' : 
              Number(order.priceImpactPct) < 3 ? 'text-yellow-400' : 
              'text-red-400'
            }`}>
              {Number(order.priceImpactPct).toFixed(3)}%
            </span>
          </div>
        )}
        
        {/* Execution Method */}
        {(order as any).swapType && (
          <div className="flex items-center justify-between border-t border-gray-800 pt-3">
            <span className="text-gray-500 text-sm">Execution Method</span>
            <span className="text-green-400 font-semibold capitalize">{((order as any).swapType as string).toUpperCase()}</span>
          </div>
        )}
        
        {/* Router */}
        {order.routePlan?.[0]?.name && (
          <div className="flex items-center justify-between border-t border-gray-800 pt-3">
            <span className="text-gray-500 text-sm">Router</span>
            <span className="text-green-400 font-semibold">{order.routePlan[0].name}</span>
          </div>
        )}
        
        <div className="text-xs text-gray-500 font-mono border-t border-gray-800 pt-3">
          {order.requestId.slice(0, 16)}
        </div>
      </div>
      
      {/* Executed vs Quoted Comparison (After Execution) */}
      {executeResult && executeResult.status === 'Success' && (
        (executeResult.executedOutAmount || executeResult.outAmount) && order.outAmount && (
          <div className="mb-6 border border-gray-800 rounded-lg p-4 bg-gray-900/50">
            <div className="text-sm font-semibold text-white mb-3">Execution Results</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Quoted Amount</span>
                <span className="text-gray-300">
                  {formatAmount(order.outAmount, getTokenByMint(config.outputMint)?.decimals || 6)} {getTokenByMint(config.outputMint)?.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Executed Amount</span>
                <span className="text-white font-semibold">
                  {formatAmount(
                    executeResult.executedOutAmount || executeResult.outAmount || 0, 
                    getTokenByMint(config.outputMint)?.decimals || 6
                  )} {getTokenByMint(config.outputMint)?.symbol}
                </span>
              </div>
              {(executeResult.executedOutAmount || executeResult.outAmount) && (
                <div className="flex items-center justify-between border-t border-gray-800 pt-2 mt-2">
                  <span className="text-gray-400">Difference</span>
                  <span className={`font-semibold ${
                    ((executeResult.executedOutAmount || executeResult.outAmount || 0) - order.outAmount) >= 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {((executeResult.executedOutAmount || executeResult.outAmount || 0) - order.outAmount) >= 0 ? '+' : ''}
                    {formatAmount(
                      ((executeResult.executedOutAmount || executeResult.outAmount || 0) - order.outAmount) / Math.pow(10, getTokenByMint(config.outputMint)?.decimals || 6),
                      getTokenByMint(config.outputMint)?.decimals || 6
                    )} {getTokenByMint(config.outputMint)?.symbol}
                    {' '}
                    ({(((executeResult.executedOutAmount || executeResult.outAmount || 0) - order.outAmount) / order.outAmount * 100).toFixed(3)}%)
                  </span>
                </div>
              )}
            </div>
          </div>
        )
      )}

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
