'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { SwapConfig, OrderResponse } from './SwapWizard';
import { TokenIcon } from './TokenIcon';
import { ApiLogEntry } from '../hooks/useApiLogger';
import { InfoTooltip } from './InfoTooltip';
import { FeatureBadge } from './FeatureBadge';
import { extractRouterName } from '../utils/routerExtractor';
import { timedApiCall } from '../utils/apiTiming';

interface Step2PreviewProps {
  config: SwapConfig;
  onComplete: (order: OrderResponse) => void;
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

export function Step2Preview({ config, onComplete, onError, onBack, loading, setLoading, addLog }: Step2PreviewProps) {
  const { publicKey } = useWallet();
  const [quote, setQuote] = useState<{
    outAmount: number;
    inAmount: number;
    priceImpactPct: number;
    routePlan: any[];
    activeRouter?: string;
    slippageBps?: number;
    orderResponse?: OrderResponse;
  } | null>(null);

  const getTokenByMint = (mint: string) => TOKENS.find(token => token.mint === mint);

  const getQuote = async () => {
    if (!publicKey) {
      onError('Wallet not connected');
      return;
    }

    setLoading(true);
    setQuote(null);

    try {
      const inputToken = getTokenByMint(config.inputMint);
      if (!inputToken) {
        throw new Error('Invalid input token');
      }

      const amountInNativeUnits = Math.floor(
        parseFloat(config.amount) * Math.pow(10, inputToken.decimals)
      );

      const url = new URL('https://api.jup.ag/ultra/v1/order');
      url.searchParams.set('inputMint', config.inputMint);
      url.searchParams.set('outputMint', config.outputMint);
      url.searchParams.set('amount', amountInNativeUnits.toString());
      url.searchParams.set('taker', publicKey.toBase58());

      const { response, timeElapsed } = await timedApiCall(async () => {
        const res = await fetch(url.toString(), {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.NEXT_PUBLIC_JUPITER_API_KEY || '',
          },
        });
        return {
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          data: await res.json(),
        };
      });

      const responseData = response.data;

      if (!response.ok) {
        const errorMsg = responseData.error || `HTTP ${response.status}`;
        
        addLog?.({
          method: 'GET',
          url: url.toString(),
          request: {
            headers: { 
              'Content-Type': 'application/json',
              'x-api-key': '***',
            },
          },
          response: {
            status: response.status,
            statusText: response.statusText,
            data: responseData,
            error: errorMsg,
            timing: timeElapsed,
          },
        });
        
        if (errorMsg.includes('balance') || errorMsg.includes('insufficient')) {
          throw new Error('Insufficient balance to complete this swap');
        }
        
        throw new Error(errorMsg);
      }

      if (!responseData.transaction) {
        if (!responseData.outAmount || responseData.outAmount === 0) {
          throw new Error('Insufficient balance to complete this swap. Please check your wallet balance.');
        }
        throw new Error('Unable to find a valid swap route. Try adjusting the amount or slippage.');
      }

      addLog?.({
        method: 'GET',
        url: url.toString(),
        request: {
          headers: { 
            'Content-Type': 'application/json',
            'x-api-key': '***',
          },
        },
        response: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
          timing: timeElapsed,
        },
      });

      const activeRouter = extractRouterName(responseData.routePlan, responseData.swapType);
      const orderWithLatency = {
        ...responseData,
        quoteLatency: timeElapsed
      };
      
      setQuote({
        outAmount: responseData.outAmount || 0,
        inAmount: responseData.inAmount || 0,
        priceImpactPct: responseData.priceImpactPct || 0,
        routePlan: responseData.routePlan || [],
        activeRouter,
        slippageBps: responseData.slippageBps,
        orderResponse: orderWithLatency
      });
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to get quote');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch quote when component mounts
  useEffect(() => {
    getQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array = run once on mount

  const formatAmount = (amount: number, decimals: number) => {
    return (amount / Math.pow(10, decimals)).toFixed(6);
  };

  const uniqueRouters = quote?.routePlan && Array.isArray(quote.routePlan) && quote.routePlan.length > 0
    ? Array.from(new Set(
        quote.routePlan.map((route: any) => extractRouterName([route])).filter(Boolean)
      ))
    : [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-2">Preview Quote</h2>
        <p className="text-sm text-gray-400">Pre-built transaction ready to sign - no RPC setup needed</p>
      </div>
      
      
      {/* Swap Summary - Clean */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-white">{config.amount}</div>
            <div className="text-sm text-gray-400 mt-1">{getTokenByMint(config.inputMint)?.symbol}</div>
          </div>
          <div className="text-gray-600 text-3xl mx-6">→</div>
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-white">
              {quote && quote.outAmount ? formatAmount(quote.outAmount, getTokenByMint(config.outputMint)?.decimals || 6) : 'Fetching...'}
            </div>
            <div className="text-sm text-gray-400 mt-1">{getTokenByMint(config.outputMint)?.symbol}</div>
          </div>
        </div>

        {quote && (
          <div className="space-y-3 border-t border-gray-800 pt-4">
            {quote.slippageBps !== undefined && quote.slippageBps !== null && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-400">Slippage Protection</span>
                  <InfoTooltip content="Maximum acceptable price movement. RTSE calculates this automatically." />
                </div>
                <span className="text-sm font-semibold text-white">{(Number(quote.slippageBps) / 100).toFixed(2)}%</span>
              </div>
            )}
            
            {quote.priceImpactPct !== undefined && quote.priceImpactPct !== null && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-400">Price Impact</span>
                  <InfoTooltip content="How much the swap moves market price. Lower is better." />
                </div>
                <span className="text-sm font-semibold text-white">{Number(quote.priceImpactPct).toFixed(3)}%</span>
              </div>
            )}

            {quote.activeRouter && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Router</span>
                <span className="text-sm font-semibold text-white">{quote.activeRouter}</span>
              </div>
            )}

          </div>
        )}

        {quote && (
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
            
            {quote.slippageBps !== undefined && quote.slippageBps !== null && (
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
          </div>
        )}

        {quote && quote.routePlan && Array.isArray(quote.routePlan) && quote.routePlan.length > 0 && (
          <div className="border-t border-gray-800 pt-4 mt-4">
            <div className="flex items-center gap-1 mb-2">
              <div className="text-xs text-gray-400">Routing Details</div>
              <InfoTooltip content="Route segments showing which DEX/AMM handles each part of your swap. Percentages can exceed 100% in multi-hop routes." />
            </div>
            {(() => {
              const totalPercent = quote.routePlan.reduce((sum: number, route: any) => {
                return sum + (route?.percent !== undefined && route?.percent !== null ? route.percent : 0);
              }, 0);
              const isMultiHop = totalPercent > 100;
              
              // Get actual route examples from the current routePlan
              const routeExamples = quote.routePlan
                .filter((route: any) => route?.percent !== undefined && route?.percent !== null)
                .slice(0, 3) // Show up to 3 examples
                .map((route: any) => {
                  const routeName = extractRouterName([route]) || 'Router';
                  return { name: routeName, percent: route.percent };
                });
              
              return (
                <>
                  {isMultiHop && (
                    <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs">
                      <div className="text-blue-400 font-medium mb-1">Why total &gt; 100%?</div>
                      <div className="text-gray-300 space-y-1">
                        <p>This swap uses <strong>multi-hop routing</strong>, where Jupiter routes your swap through multiple DEXes and intermediate tokens to find the best price.</p>
                        <p>Each entry shows a DEX/AMM used in the routing path. When routing involves multiple hops or parallel routes, percentages can exceed 100% because they represent different segments of the routing strategy.</p>
                        {routeExamples.length > 0 && (
                          <p className="text-gray-400 mt-1">
                            Example routes in this swap: {routeExamples.map((ex: any, idx: number) => (
                              <span key={idx}>
                                <strong>{ex.name} ({ex.percent}%)</strong>
                                {idx < routeExamples.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    {quote.routePlan.map((route: any, idx: number) => {
                      const routeName = extractRouterName([route]) || `Route ${idx + 1}`;
                      return (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">{routeName}</span>
                          {route?.percent !== undefined && route?.percent !== null && (
                            <span className="text-white font-medium">{route.percent}%</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {uniqueRouters.length > 0 && (
        <div className="mb-6 bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-2">Routers in This Quote</div>
          <div className="flex items-center gap-2 flex-wrap">
            {uniqueRouters.map((routerName, idx) => (
              <span key={idx} className="text-xs bg-gray-800 text-white px-2 py-1 rounded border border-gray-700">
                {routerName}
              </span>
            ))}
          </div>
        </div>
      )}


      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 bg-gray-800 border border-gray-700 hover:bg-gray-750 disabled:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Back
        </button>
        
        {quote && !loading && (
          <button
            onClick={getQuote}
            disabled={loading}
            className="px-4 py-3 bg-gray-800 border border-gray-700 hover:bg-gray-750 disabled:bg-gray-900 text-white rounded-lg transition-colors"
            title="Refresh quote"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
        
        <button
          onClick={() => {
            if (quote && quote.orderResponse) {
              onComplete(quote.orderResponse);
            }
          }}
          disabled={loading || !quote}
          className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Getting Quote...' : 'Proceed to Execute'}
        </button>
      </div>

      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
          <p className="text-gray-500 mt-2">Fetching quote...</p>
        </div>
      )}
    </div>
  );
}
