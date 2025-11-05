'use client';

import { useState } from 'react';

export function ComparisonSection() {
  const [activeTab, setActiveTab] = useState<'user' | 'dev'>('user');

  return (
    <div className="mb-6 bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setActiveTab('user')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            activeTab === 'user'
              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
              : 'text-gray-500 hover:text-gray-400'
          }`}
        >
          User Experience
        </button>
        <button
          onClick={() => setActiveTab('dev')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            activeTab === 'dev'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
              : 'text-gray-500 hover:text-gray-400'
          }`}
        >
          Developer Experience
        </button>
      </div>

      {activeTab === 'user' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="text-xs font-semibold text-red-400 mb-2">Traditional Way</div>
              <ul className="space-y-1.5 text-xs text-gray-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 mt-0.5">✗</span>
                  <span>Manual slippage settings</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 mt-0.5">✗</span>
                  <span>Need SOL for gas fees</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 mt-0.5">✗</span>
                  <span>1-3 block wait time</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 mt-0.5">✗</span>
                  <span>Higher MEV risk</span>
                </li>
              </ul>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="text-xs font-semibold text-green-400 mb-2">With Ultra V3</div>
              <ul className="space-y-1.5 text-xs text-gray-300">
                <li className="flex items-start gap-1.5">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>RTSE auto-calculates optimal slippage</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Gasless swaps (auto-deducted)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Sub-second landing (0-1 block)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>34x better MEV protection</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="text-xs font-semibold text-blue-400 mb-2">Result: Better Prices</div>
            <p className="text-xs text-gray-300">
              On average, Ultra V3 delivers <span className="font-bold text-green-400">+0.63 bps positive slippage</span> (Source: Jupiter Internal Monitoring Oct 7-14, 2025). 
              Predictive Execution simulates routes on-chain to verify executable price vs quoted price, selecting the route with least slippage. 
              You get more tokens than quoted, not less.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'dev' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="text-xs font-semibold text-red-400 mb-2">Traditional Way</div>
              <ul className="space-y-1.5 text-xs text-gray-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 mt-0.5">✗</span>
                  <span>Set up RPC provider</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 mt-0.5">✗</span>
                  <span>Build transactions manually</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 mt-0.5">✗</span>
                  <span>Calculate accounts & compute budget</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 mt-0.5">✗</span>
                  <span>Host & maintain infrastructure</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 mt-0.5">✗</span>
                  <span>Handle quote refresh logic</span>
                </li>
              </ul>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="text-xs font-semibold text-green-400 mb-2">With Ultra V3</div>
              <ul className="space-y-1.5 text-xs text-gray-300">
                <li className="flex items-start gap-1.5">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Zero RPC setup - just API calls</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Pre-built transactions ready to sign</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>All complexity handled by Jupiter</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Single API key - no infrastructure</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Production-ready at scale</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <div className="text-xs font-semibold text-purple-400 mb-2">Code Comparison</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-gray-500 mb-1">Traditional (50+ lines):</div>
                <pre className="text-[10px] text-gray-400 bg-gray-950 p-2 rounded overflow-x-auto">
{`const connection = 
  new Connection(...);
const swap = 
  await createSwap(...);
const tx = new Transaction();
// ... 40+ more lines`}
                </pre>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Ultra V3 (3 lines):</div>
                <pre className="text-[10px] text-green-400 bg-gray-950 p-2 rounded overflow-x-auto">
{`const quote = await fetch(
  '/ultra/v1/order?...'
);
const signed = await 
  signTransaction(quote);`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

