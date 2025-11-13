'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { VersionedTransaction } from '@solana/web3.js';
import { SwapConfig, OrderResponse, ExecuteResponse } from './SwapWizard';
import { ApiLogEntry } from '../hooks/useApiLogger';
import { FeatureBadge } from './FeatureBadge';
import { decodeTransaction } from '../utils/transactionDecoder';
import { InfoTooltip } from './InfoTooltip';
import { extractRouterName } from '../utils/routerExtractor';
import { timedApiCall } from '../utils/apiTiming';

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
  const [transactionLandingTime, setTransactionLandingTime] = useState<number | null>(null);
  const [executionLatency, setExecutionLatency] = useState<number | null>(null);
  const [isGasless, setIsGasless] = useState<boolean>(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const getTokenByMint = (mint: string) => TOKENS.find(token => token.mint === mint);

  const checkGaslessTransaction = () => {
    try {
      const decoded = decodeTransaction(order.transaction);
      if (decoded && decoded.message.header.numRequiredSignatures > 1) {
        setIsGasless(true);
      }
    } catch (e) {
      // Ignore
    }
  };
  useEffect(() => {
    checkGaslessTransaction();
  }, [order.transaction]);

  const executeSwap = async () => {
    if (!signTransaction) {
      onError('Wallet not connected');
      return;
    }

    setLoading(true);
    setExecuteResult(null);
    setExecutionError(null);

    try {
      const transactionBuffer = Buffer.from(order.transaction, 'base64');
      const transaction = VersionedTransaction.deserialize(transactionBuffer);

      let signedTransaction;
      try {
        signedTransaction = await signTransaction(transaction);
      } catch (signError) {
        console.error('Transaction signing failed:', signError);
        throw new Error(`Failed to sign transaction: ${signError instanceof Error ? signError.message : 'Unknown signing error'}`);
      }

      const signedTransactionBase64 = Buffer.from(signedTransaction.serialize()).toString('base64');

      const requestBody = {
        signedTransaction: signedTransactionBase64,
        requestId: order.requestId,
      };

      const executionStartTime = performance.now();
      
      const { response: executeResponse, timeElapsed } = await timedApiCall(async () => {
        const res = await fetch('https://api.jup.ag/ultra/v1/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.NEXT_PUBLIC_JUPITER_API_KEY || '',
          },
          body: JSON.stringify(requestBody),
        });

        // Parse response body
        let data;
        const contentType = res.headers.get('content-type');
        const responseText = await res.text();
        
        if (contentType && contentType.includes('application/json')) {
          try {
            data = JSON.parse(responseText);
          } catch (jsonError) {
            console.error('Failed to parse JSON response:', jsonError);
            console.error('Response text:', responseText);
            throw new Error(`Invalid JSON response from API: ${responseText.substring(0, 200)}`);
          }
        } else {
          throw new Error(`Expected JSON response but got: ${contentType}. Body: ${responseText.substring(0, 200)}`);
        }

        return {
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          data,
        };
      });

      const landingTime = performance.now() - executionStartTime;
      
      setExecutionLatency(timeElapsed);
      setTransactionLandingTime(landingTime);
      const result = executeResponse.data;

      // Debug logging
      console.log('Execute API Response:', {
        status: executeResponse.status,
        statusText: executeResponse.statusText,
        ok: executeResponse.ok,
        data: result
      });

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
          timing: timeElapsed,
        },
      });

      if (!executeResponse.ok) {
        const errorMessage = result.error || `HTTP ${executeResponse.status}`;
        if (errorMessage.toLowerCase().includes('order not found') || 
            errorMessage.toLowerCase().includes('expired') ||
            executeResponse.status === 404) {
          throw new Error('Order expired. Please go back and create a new order. Orders expire after a short time to ensure prices stay current.');
        }
        throw new Error(errorMessage);
      }

      // Check if response has error even with 200 status
      if (result.error && result.status !== 'Success') {
        throw new Error(result.error || 'Transaction failed');
      }

      // Check for required signature field
      if (!result.signature) {
        console.error('Execute response missing signature:', result);
        throw new Error('Transaction response missing signature. The transaction may have failed or be pending. Check the Developer Mode logs for details.');
      }

      const executeResponseData: ExecuteResponse = {
        status: result.status || 'Success',
        signature: result.signature,
        error: result.error,
        executedOutAmount: result.executedOutAmount,
        executedInAmount: result.executedInAmount,
        outAmount: result.outAmount,
        inAmount: result.inAmount,
      };
      setTimeout(() => {
        setExecuteResult(executeResponseData);
        onComplete(executeResponseData);
      }, 500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to execute swap';
      setExecutionError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, decimals: number) => {
    return (amount / Math.pow(10, decimals)).toFixed(6);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-2">Execute Swap</h2>
        <p className="text-sm text-gray-400">Review and execute your swap</p>
      </div>
      
      <div className="mb-6 bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-white">{config.amount}</div>
            <div className="text-sm text-gray-400 mt-1">{getTokenByMint(config.inputMint)?.symbol}</div>
          </div>
          <div className="text-gray-600 text-3xl mx-6">→</div>
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-white">
              {order.outAmount ? formatAmount(order.outAmount, getTokenByMint(config.outputMint)?.decimals || 6) : '...'}
            </div>
            <div className="text-sm text-gray-400 mt-1">{getTokenByMint(config.outputMint)?.symbol}</div>
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-800 pt-4">
          {order.slippageBps !== undefined && order.slippageBps !== null && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-400">Slippage Protection</span>
                <InfoTooltip content="Maximum acceptable price movement. RTSE calculates this automatically." />
              </div>
              <span className="text-sm font-semibold text-white">{(Number(order.slippageBps) / 100).toFixed(2)}%</span>
            </div>
          )}
          
          {order.priceImpactPct !== undefined && order.priceImpactPct !== null && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-400">Price Impact</span>
                <InfoTooltip content="How much the swap moves market price. Lower is better." />
              </div>
              <span className="text-sm font-semibold text-white">{Number(order.priceImpactPct).toFixed(3)}%</span>
            </div>
          )}

          {(() => {
            const routerName = extractRouterName(order.routePlan, order.swapType);
            return routerName ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Router</span>
                <span className="text-sm font-semibold text-white">{routerName}</span>
              </div>
            ) : null;
          })()}

          {order.swapType && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Execution Method</span>
              <span className="text-sm font-semibold text-white">{order.swapType.toUpperCase()}</span>
            </div>
          )}

        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-gray-800 pt-4 mt-4">
          <FeatureBadge
            icon={
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            label="MEV Protected"
            description="34x better MEV protection. Jupiter Beam routes through our infrastructure."
            stat="34x"
            color="green"
          />
          
          <FeatureBadge
            icon={
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            label="Predictive Execution"
            description="Routes simulated on-chain before execution for better prices."
            color="blue"
          />
          
          {order.slippageBps !== undefined && order.slippageBps !== null && (
            <FeatureBadge
              icon={
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              label="RTSE Optimized"
              description="Automatic slippage calculation based on token volatility."
              color="purple"
            />
          )}
          
          {isGasless && (
            <FeatureBadge
              icon={
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              label="Gasless"
              description="Gas fees covered automatically."
              color="yellow"
            />
          )}
        </div>
      </div>
      
      {executeResult && executeResult.status === 'Success' && (
        <>
          {(executeResult.executedOutAmount || executeResult.outAmount) && order.outAmount && (
            <div className="mb-6 bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Execution Results</h3>
                {((executeResult.executedOutAmount || executeResult.outAmount || 0) - order.outAmount) >= 0 && (
                  <span className="text-xs font-medium text-white bg-gray-800 px-2 py-1 rounded">Better Than Quoted</span>
                )}
              </div>
              
              <div className="space-y-3 border-t border-gray-800 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Quoted Amount</span>
                  <span className="text-sm font-semibold text-white">
                    {formatAmount(order.outAmount, getTokenByMint(config.outputMint)?.decimals || 6)} {getTokenByMint(config.outputMint)?.symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Executed Amount</span>
                  <span className="text-sm font-semibold text-white">
                    {formatAmount(
                      executeResult.executedOutAmount || executeResult.outAmount || 0, 
                      getTokenByMint(config.outputMint)?.decimals || 6
                    )} {getTokenByMint(config.outputMint)?.symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Difference</span>
                  <span className="text-sm font-semibold text-white">
                    {((executeResult.executedOutAmount || executeResult.outAmount || 0) - order.outAmount) >= 0 ? '+' : ''}
                    {(((executeResult.executedOutAmount || executeResult.outAmount || 0) - order.outAmount) / order.outAmount * 100).toFixed(4)}%
                    {' '}({formatAmount(
                      ((executeResult.executedOutAmount || executeResult.outAmount || 0) - order.outAmount) / Math.pow(10, getTokenByMint(config.outputMint)?.decimals || 6),
                      getTokenByMint(config.outputMint)?.decimals || 6
                    )} {getTokenByMint(config.outputMint)?.symbol})
                  </span>
                </div>
              </div>

            </div>
          )}
        </>
      )}

      {executionError && (
        <div className="mb-6 border border-red-500/30 rounded-lg p-4 bg-gray-900">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <div className="text-sm text-red-500 font-medium mb-1">
                {executionError}
              </div>
              {executionError.includes('expired') && (
                <div className="mt-3">
                  <button
                    onClick={onBack}
                    className="text-sm text-blue-400 hover:text-blue-300 underline"
                  >
                    Go back and create a new order →
                  </button>
                </div>
              )}
              {!executionError.includes('expired') && (
                <details className="mt-3">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                    🔍 Troubleshooting tips
                  </summary>
                  <div className="mt-2 text-xs text-gray-400 space-y-2 pl-4">
                    <div>• <strong>Check Developer Mode:</strong> Click the toggle in the bottom-right to see full API response</div>
                    <div>• <strong>Wallet issues:</strong> Make sure your wallet is unlocked and connected</div>
                    <div>• <strong>Insufficient SOL:</strong> You need a small amount of SOL for transaction fees</div>
                    <div>• <strong>Order expired:</strong> Go back and create a new order if it&apos;s been more than 30 seconds</div>
                    <div>• <strong>Network congestion:</strong> Solana network might be busy, try again in a moment</div>
                    <div>• <strong>Browser console:</strong> Press F12 and check the Console tab for detailed error logs</div>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )}

      {executeResult && executeResult.status === 'Success' && executeResult.error && (
        <div className="mb-6 border border-yellow-500/30 rounded-lg p-4 bg-gray-900">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <div className="text-sm text-yellow-400 font-medium mb-1">
                Transaction Note
              </div>
              <div className="text-sm text-gray-300 mb-2">
                {(() => {
                  const errorMsg = executeResult.error;
                  if (errorMsg.includes('2502') || errorMsg.includes('0x9c6')) {
                    return (
                      <div>
                        <div className="mb-2">{errorMsg}</div>
                        <div className="text-xs text-gray-400 mt-2">
                          <strong>Error 2502 (0x9c6):</strong> RequireKeysEqViolated - A constraint check in one of the DEX programs in the route failed. This is typically non-fatal and the swap still completed successfully.
                        </div>
                      </div>
                    );
                  }
                  if (errorMsg.includes('custom program error')) {
                    return (
                      <div>
                        <div className="mb-2">{errorMsg}</div>
                        <div className="text-xs text-gray-400 mt-2">
                          This error code comes from a DEX program in the routing path. Only Jupiter V6 errors are automatically parsed; other DEX program errors show as custom program errors. The swap completed successfully despite this error.
                        </div>
                      </div>
                    );
                  }
                  return errorMsg;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {!executeResult || executionError ? (
        <div className="flex space-x-4">
          <button
            onClick={onBack}
            disabled={loading}
            className="flex-1 bg-gray-800 border border-gray-700 hover:bg-gray-750 disabled:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Back
          </button>
          
          {executionError && !executionError.includes('expired') && (
            <button
              onClick={executeSwap}
              disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Retrying...' : 'Retry'}
            </button>
          )}
          
          {!executionError && (
            <button
              onClick={executeSwap}
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Executing...' : 'Execute Swap'}
            </button>
          )}
        </div>
      ) : null}

      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
          <p className="text-gray-500 mt-2">Executing...</p>
        </div>
      )}
    </div>
  );
}
