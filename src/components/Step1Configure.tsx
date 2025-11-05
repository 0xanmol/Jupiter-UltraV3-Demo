'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { SwapConfig } from './SwapWizard';
import { TokenIcon } from './TokenIcon';
import { ApiLogEntry } from '../hooks/useApiLogger';
import { timedApiCall } from '../utils/apiTiming';
import { ContextualHint } from './ContextualHint';

interface Step1ConfigureProps {
  config: SwapConfig;
  onComplete: (config: SwapConfig) => void;
  onError: (error: string) => void;
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

export function Step1Configure({ config, onComplete, onError, loading, setLoading, addLog }: Step1ConfigureProps) {
  const { publicKey } = useWallet();
  const [localConfig, setLocalConfig] = useState<SwapConfig>(config);
  const [balance, setBalance] = useState<string>('');

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) {
        setBalance('');
        return;
      }

      const inputToken = getTokenByMint(localConfig.inputMint);
      if (!inputToken) {
        setBalance('');
        return;
      }

      try {
        const url = `https://api.jup.ag/ultra/v1/holdings/${publicKey.toBase58()}`;
        
        const { response, timeElapsed } = await timedApiCall(async () => {
          const res = await fetch(url, {
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
            data: response.data,
            error: !response.ok ? response.data.error : undefined,
            timing: timeElapsed,
          },
        });

        if (!response.ok) {
          setBalance('...');
          return;
        }

        if (localConfig.inputMint === 'So11111111111111111111111111111111111111112') {
          setBalance(response.data.uiAmountString || '0');
        } else if (response.data.tokens && response.data.tokens[localConfig.inputMint]) {
          const tokenAccounts = response.data.tokens[localConfig.inputMint];
          if (Array.isArray(tokenAccounts) && tokenAccounts.length > 0) {
            setBalance(tokenAccounts[0].uiAmountString || '0');
          } else {
            setBalance('0');
          }
        } else {
          setBalance('0');
        }
      } catch (error) {
        setBalance('...');
      }
    };

    fetchBalance();
  }, [publicKey, localConfig.inputMint]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!localConfig.amount || parseFloat(localConfig.amount) <= 0) {
      onError('Please enter a valid amount');
      return;
    }

    if (localConfig.inputMint === localConfig.outputMint) {
      onError('Input and output tokens must be different');
      return;
    }

    // Check if user has sufficient balance
    if (!publicKey) {
      onError('Wallet not connected');
      return;
    }

    if (balance === '...') {
      onError('Loading balance... Please wait');
      return;
    }

    const requestedAmount = parseFloat(localConfig.amount);
    const userBalance = parseFloat(balance);
    
    if (userBalance >= 0 && requestedAmount > userBalance) {
      const inputToken = getTokenByMint(localConfig.inputMint);
      onError(`Insufficient balance. You have ${balance} ${inputToken?.symbol}`);
      return;
    }

    onComplete(localConfig);
  };

  const getTokenByMint = (mint: string) => TOKENS.find(token => token.mint === mint);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-white mb-2">Configure Your Swap</h2>
        <p className="text-sm text-gray-400">Ultra handles routing, slippage, and execution automatically</p>
      </div>
      
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Token */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            From Token
          </label>
          <div className="flex items-center gap-2">
            <TokenIcon mint={localConfig.inputMint} size={32} />
            <select
              value={localConfig.inputMint}
              onChange={(e) => setLocalConfig({ ...localConfig, inputMint: e.target.value })}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={loading}
            >
              {TOKENS.map((token) => (
                <option key={token.mint} value={token.mint}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reverse Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              setLocalConfig({
                ...localConfig,
                inputMint: localConfig.outputMint,
                outputMint: localConfig.inputMint,
              });
            }}
            disabled={loading}
            className="p-2 rounded-full border border-gray-600 hover:border-green-500 hover:bg-green-500/10 transition-all"
          >
            <svg className="w-5 h-5 text-gray-400 hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* Output Token */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            To Token
          </label>
          <div className="flex items-center gap-2">
            <TokenIcon mint={localConfig.outputMint} size={32} />
            <select
              value={localConfig.outputMint}
              onChange={(e) => setLocalConfig({ ...localConfig, outputMint: e.target.value })}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={loading}
            >
              {TOKENS.map((token) => (
                <option key={token.mint} value={token.mint}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">
              Amount ({getTokenByMint(localConfig.inputMint)?.symbol})
            </label>
            {balance && (
              <span className="text-xs text-gray-500">
                Balance: {balance}
              </span>
            )}
          </div>
          <input
            type="number"
            step="0.000001"
            min="0"
            value={localConfig.amount}
            onChange={(e) => setLocalConfig({ ...localConfig, amount: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0.1"
            disabled={loading}
          />
        </div>

        {/* Slippage */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Slippage Tolerance (%)
          </label>
          <div className="flex space-x-2">
            {[0.1, 0.5, 1.0].map((slippage) => (
              <button
                key={slippage}
                type="button"
                onClick={() => setLocalConfig({ ...localConfig, slippage })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  localConfig.slippage === slippage
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-750'
                }`}
                disabled={loading}
              >
                {slippage}%
              </button>
            ))}
            <input
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={localConfig.slippage}
              onChange={(e) => setLocalConfig({ ...localConfig, slippage: parseFloat(e.target.value) || 0 })}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Custom"
              disabled={loading}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Loading...' : 'Get Quote'}
        </button>
      </form>
    </div>
  );
}
