'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { SwapConfig, OrderResponse } from './SwapWizard';
import { TokenIcon } from './TokenIcon';
import { ApiLogEntry } from '../hooks/useApiLogger';

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
  } | null>(null);
  const [routers, setRouters] = useState<any[]>([]);

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

      const startTime = Date.now();
      
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_JUPITER_API_KEY || '',
        },
      });

      const timing = Date.now() - startTime;
      const responseData = await response.json();

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
            timing,
          },
        });
        
        // Check for common balance-related errors
        if (errorMsg.includes('balance') || errorMsg.includes('insufficient')) {
          throw new Error('Insufficient balance to complete this swap');
        }
        
        throw new Error(errorMsg);
      }

      if (!responseData.transaction) {
        // Check if this might be a balance issue
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
          timing,
        },
      });

      // Extract router from response
      const activeRouter = responseData.swapType || responseData.routePlan?.[0]?.name || null;
      console.log('Active router from quote:', activeRouter, 'Full response:', responseData);
      
      // Store quote data with proper structure
      setQuote({
        outAmount: responseData.outAmount || 0,
        inAmount: responseData.inAmount || 0,
        priceImpactPct: responseData.priceImpactPct || 0,
        routePlan: responseData.routePlan || [],
        activeRouter: activeRouter
      });
      onComplete(responseData);
    } catch (error) {
      console.error('Quote error:', error);
      onError(error instanceof Error ? error.message : 'Failed to get quote');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, decimals: number) => {
    return (amount / Math.pow(10, decimals)).toFixed(6);
  };

  useEffect(() => {
    const fetchRouters = async () => {
      try {
        const url = 'https://api.jup.ag/ultra/v1/order/routers';
        const startTime = Date.now();
        
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'ec7da460-69ff-4460-80dd-6b411efc8c4a',
          },
        });
        
        const timing = Date.now() - startTime;
        
        if (response.ok) {
          try {
            const data = await response.json();
            
            console.log('Available routers from API:', data);
            
            addLog?.({
              method: 'GET',
              url,
              request: {
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': '***',
                },
              },
              response: {
                status: response.status,
                statusText: response.statusText,
                data,
                timing,
              },
            });
            
            setRouters(data || []);
          } catch (jsonError) {
            const text = await response.text();
            console.log('Routers response (non-JSON):', text.substring(0, 200));
          }
        } else {
          addLog?.({
            method: 'GET',
            url,
            request: {
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': '***',
              },
            },
            response: {
              status: response.status,
              statusText: response.statusText,
              error: `HTTP ${response.status}`,
              timing,
            },
          });
        }
      } catch (error) {
        console.error('Failed to fetch routers:', error);
      }
    };
    
    fetchRouters();
  }, [addLog]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-6">Preview Quote</h2>
      
      {/* Swap Summary */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <TokenIcon mint={config.inputMint} size={48} />
            <div>
              <p className="text-white font-semibold">{config.amount} {getTokenByMint(config.inputMint)?.symbol}</p>
              <p className="text-gray-500 text-sm">{getTokenByMint(config.inputMint)?.name}</p>
            </div>
          </div>
          
          <div className="text-gray-500">→</div>
          
          <div className="flex items-center space-x-3">
            <TokenIcon mint={config.outputMint} size={48} />
            <div>
              <p className="text-white font-semibold">
                {quote && quote.outAmount ? formatAmount(quote.outAmount, getTokenByMint(config.outputMint)?.decimals || 6) : 'Fetching...'} {getTokenByMint(config.outputMint)?.symbol}
              </p>
              <p className="text-gray-500 text-sm">{getTokenByMint(config.outputMint)?.name}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Available Routers */}
      {routers.length > 0 && (
        <div className="mb-6 bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Available Routers</span>
            <div className="flex items-center gap-2 flex-wrap">
              {routers.map((router, idx) => (
                <span key={idx} className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30">
                  {router?.name || router?.id || 'Router'}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Swap Preview */}
      {quote && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <span className="text-gray-500 text-sm">Swap</span>
            <div className="flex items-center gap-2 text-white">
              <TokenIcon mint={config.inputMint} size={20} />
              <span>{formatAmount(quote.inAmount || 0, getTokenByMint(config.inputMint)?.decimals || 9)} {getTokenByMint(config.inputMint)?.symbol}</span>
              <span className="text-gray-500">→</span>
              <TokenIcon mint={config.outputMint} size={20} />
              <span>{formatAmount(quote.outAmount || 0, getTokenByMint(config.outputMint)?.decimals || 6)} {getTokenByMint(config.outputMint)?.symbol}</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <span className="text-gray-500 text-sm">Slippage</span>
            <span className="text-white">{config.slippage}%</span>
          </div>
          {quote.activeRouter && (
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <span className="text-gray-500 text-sm">Router</span>
              <span className="text-white font-semibold">{quote.activeRouter}</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 bg-gray-800 border border-gray-700 hover:bg-gray-750 disabled:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Back
        </button>
        
        <button
          onClick={getQuote}
          disabled={loading}
          className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Getting Quote...' : quote ? 'Proceed to Execute' : 'Get Quote'}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
          <p className="text-gray-500 mt-2">Fetching quote...</p>
        </div>
      )}
    </div>
  );
}
