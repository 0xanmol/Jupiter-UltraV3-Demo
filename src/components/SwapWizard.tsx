'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { VersionedTransaction } from '@solana/web3.js';
import { Step1Configure } from './Step1Configure';
import { Step2Preview } from './Step2Preview';
import { Step3Execute } from './Step3Execute';
import { DeveloperMode } from './DeveloperMode';
import { useApiLogger } from '../hooks/useApiLogger';
import { timedApiCall } from '../utils/apiTiming';

export interface SwapConfig {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippage: number;
}

/**
 * Order Response from /ultra/v1/order endpoint
 * Per Jupiter Ultra API docs: https://dev.jup.ag/api-reference/ultra/order
 */
export interface OrderResponse {
  transaction: string; // Base64 encoded unsigned transaction
  requestId: string; // Used for /execute endpoint
  slippageBps: number; // Slippage in basis points (RTSE optimized)
  swapType: string; // Execution method (e.g., "iris", "jupiterz")
  feeMint?: string; // Token mint for fees (from priority list)
  feeBps?: number; // Total fee in basis points
  outAmount?: number; // Output amount in native units (quoted)
  inAmount?: number; // Input amount in native units
  priceImpactPct?: number; // Price impact percentage
  quoteLatency?: number; // API call latency in ms (not from API, calculated client-side)
  routePlan?: Array<{
    name?: string; // Router name (e.g., "Iris", "JupiterZ", "OKX")
    percent?: number; // Percentage of route split
    [key: string]: any; // Additional route-specific fields
  }>;
}

/**
 * Execute Response from /ultra/v1/execute endpoint
 * Per Jupiter Ultra API docs: https://dev.jup.ag/api-reference/ultra/execute
 */
export interface ExecuteResponse {
  status: 'Success' | 'Failed' | 'Pending';
  signature?: string; // Transaction signature
  error?: string; // Error message if failed
  outAmount?: number; // Output amount in native units (may be present)
  inAmount?: number; // Input amount in native units (may be present)
  executedOutAmount?: number; // Actual executed output amount (Ultra V3 feature)
  executedInAmount?: number; // Actual executed input amount (Ultra V3 feature)
}

export function SwapWizard() {
  const { connected, publicKey } = useWallet();
  const { logs, clearLogs, addLog } = useApiLogger();
  const [currentStep, setCurrentStep] = useState(1);
  const [swapConfig, setSwapConfig] = useState<SwapConfig>({
    inputMint: 'So11111111111111111111111111111111111111112', // SOL
    outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    amount: '0.1',
    slippage: 0.5
  });
  const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(null);
  const [executeResponse, setExecuteResponse] = useState<ExecuteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Check for API key - must be done in useEffect for client components
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [showDevModeHint, setShowDevModeHint] = useState(false);
  
  // Check API key on mount
  useEffect(() => {
    setHasApiKey(!!process.env.NEXT_PUBLIC_JUPITER_API_KEY);
  }, []);

  // Show dev mode hint when wallet is connected
  useEffect(() => {
    if (!connected) return;
    
    // Check if user has dismissed the dev mode hint
    const dismissed = localStorage.getItem('dev-mode-hint-dismissed');
    if (dismissed === 'true') return;
    
    // Show hint after a short delay when user starts interacting
    const timer = setTimeout(() => {
      setShowDevModeHint(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [connected]);

  const handleDismissDevModeHint = () => {
    setShowDevModeHint(false);
    localStorage.setItem('dev-mode-hint-dismissed', 'true');
  };

  const handleReplayRequest = async (log: any) => {
    try {
      const headers = { ...log.request.headers };
      if (headers['x-api-key'] === '***') {
        headers['x-api-key'] = process.env.NEXT_PUBLIC_JUPITER_API_KEY || '';
      }
      
      const { response, timeElapsed } = await timedApiCall(async () => {
        const res = await fetch(log.url, {
          method: log.method,
          headers,
          body: log.request.body ? JSON.stringify(log.request.body) : undefined,
        });
        return {
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          data: await res.json(),
        };
      });
      
      addLog({
        method: log.method,
        url: log.url,
        request: {
          headers: { ...headers, 'x-api-key': '***' },
          body: log.request.body,
        },
        response: {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          error: !response.ok ? response.data.error : undefined,
          timing: timeElapsed,
        },
      });
    } catch (error) {
      // Silent fail for replay
    }
  };

  if (hasApiKey === false) {
    return (
      <div className="bg-yellow-900 border border-yellow-700 text-yellow-100 px-6 py-4 rounded-lg">
        <p className="font-semibold text-lg mb-2">⚠️ API Key Required</p>
        <p className="mb-3">To use this demo, you need a Jupiter API key:</p>
        <ol className="list-decimal list-inside space-y-2 mb-3">
          <li>Get your API key from <a href="https://portal.jup.ag" className="underline text-yellow-300" target="_blank" rel="noopener noreferrer">portal.jup.ag</a></li>
          <li>Copy <code className="bg-yellow-800 px-1 rounded">.env.example</code> to <code className="bg-yellow-800 px-1 rounded">.env.local</code></li>
          <li>Add your API key to <code className="bg-yellow-800 px-1 rounded">.env.local</code></li>
          <li>Restart the dev server</li>
        </ol>
        <p className="text-sm text-yellow-200">Read the README for detailed instructions.</p>
      </div>
    );
  }

  const handleStep1Complete = (config: SwapConfig) => {
    setSwapConfig(config);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(2);
      setIsTransitioning(false);
    }, 300);
    setError(null);
  };

  const handleStep2Complete = (order: OrderResponse) => {
    setError(null);
    // Set order first, then transition to step 3 to avoid flash of old UI
    setOrderResponse(order);
    setIsTransitioning(true);
    // Use requestAnimationFrame to ensure order state is updated before step change
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setCurrentStep(3);
        setIsTransitioning(false);
      });
    });
  };

  const handleStep3Complete = (result: ExecuteResponse) => {
    setExecuteResponse(result);
    setError(null);
    
    if (result.status === 'Success') {
      setShowSuccessAnimation(true);
      setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 2000);
    }
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setOrderResponse(null);
    setExecuteResponse(null);
    setError(null);
  };

  if (!connected) {
    return (
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-4">
          Connect Your Wallet
        </h2>
        <p className="text-gray-500 text-lg mb-6">
          Connect your Solana wallet above to start swapping
        </p>
        <p className="text-gray-400 text-sm">
          Use the &ldquo;Connect Wallet&rdquo; button above to get started
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl p-8 relative">

      {/* Success Animation Overlay */}
      <div className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity duration-500 ${showSuccessAnimation ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`text-center transition-all duration-700 ${showSuccessAnimation ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
          <div className={`w-24 h-24 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/50 transition-all duration-500 ${showSuccessAnimation ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className={`text-2xl font-bold text-white mb-2 transition-all duration-700 delay-100 ${showSuccessAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            Swap Successful!
          </h3>
          <p className={`text-gray-400 transition-all duration-700 delay-200 ${showSuccessAnimation ? 'opacity-100' : 'opacity-0'}`}>
            Transaction confirmed
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                step <= currentStep
                  ? 'bg-green-500 text-white scale-110'
                  : 'bg-gray-800 text-gray-500 border border-gray-700'
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`w-20 h-1 mx-3 rounded-full transition-all duration-500 ${
                  step < currentStep ? 'bg-green-500 scale-y-100' : 'bg-gray-800'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex justify-between mb-8 text-sm">
        <span className={`transition-all duration-300 ${currentStep === 1 ? 'text-green-500 font-semibold scale-105' : 'text-gray-500'}`}>
          Configure
        </span>
        <span className={`transition-all duration-300 ${currentStep === 2 ? 'text-green-500 font-semibold scale-105' : 'text-gray-500'}`}>
          Preview Quote
        </span>
        <span className={`transition-all duration-300 ${currentStep === 3 ? 'text-green-500 font-semibold scale-105' : 'text-gray-500'}`}>
          Execute Swap
        </span>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100'}`}>
        {currentStep === 1 && (
          <Step1Configure
            config={swapConfig}
            onComplete={handleStep1Complete}
            onError={setError}
            loading={loading}
            setLoading={setLoading}
            addLog={addLog}
          />
        )}

              {currentStep === 2 && (
                <Step2Preview
                  config={swapConfig}
                  onComplete={handleStep2Complete}
                  onError={setError}
                  onBack={() => setCurrentStep(1)}
                  loading={loading}
                  setLoading={setLoading}
                  addLog={addLog}
                />
              )}

              {currentStep === 3 && orderResponse && (
                <Step3Execute
                  config={swapConfig}
                  order={orderResponse}
                  onComplete={handleStep3Complete}
                  onError={setError}
                  onBack={() => setCurrentStep(2)}
                  loading={loading}
                  setLoading={setLoading}
                  addLog={addLog}
                />
              )}
      </div>

      {/* Success Message */}
      {executeResponse?.status === 'Success' && !showSuccessAnimation && (
        <div className="mt-6 border border-green-500/30 rounded-lg p-4 bg-gray-900 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-sm text-green-500 mb-2">Transaction confirmed</div>
          <a
            href={`https://solscan.io/tx/${executeResponse.signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-gray-400 hover:text-green-500 break-all block mb-4"
          >
            {executeResponse.signature}
          </a>
          <button
            onClick={resetWizard}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            New swap
          </button>
        </div>
      )}
      
      <DeveloperMode logs={logs} onClear={clearLogs} onOpen={handleDismissDevModeHint} onReplayRequest={handleReplayRequest} />
    </div>
  );
}
