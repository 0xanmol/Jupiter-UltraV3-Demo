'use client';

export function LearnSection() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12">
      {/* Why Ultra V3 */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Why Ultra V3?</h2>
        
        <div className="space-y-6">
          {/* For Users */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">For Users</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-0.5">✓</span>
                <div>
                  <span className="font-medium text-white">Better prices:</span> On average, Ultra delivers +0.63 bps positive slippage (more tokens than quoted). Predictive Execution simulates routes on-chain before execution to verify actual executed price vs quoted price.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-0.5">✓</span>
                <div>
                  <span className="font-medium text-white">Faster:</span> Sub-second transaction landing (0-1 block, ~50-400ms). 50-66% faster than traditional methods (1-3 blocks, ~400ms-1.2s).
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-0.5">✓</span>
                <div>
                  <span className="font-medium text-white">Safer:</span> 34x better MEV protection than top trading terminals. Jupiter Beam routes transactions through our own infrastructure, ensuring complete transaction privacy until on-chain execution.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-0.5">✓</span>
                <div>
                  <span className="font-medium text-white">No setup needed:</span> No slippage guessing, no gas management, no RPC selection. Everything handled automatically.
                </div>
              </li>
            </ul>
          </div>

          {/* For Developers */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">For Developers</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">✓</span>
                <div>
                  <span className="font-medium text-white">RPC-less:</span> No Connection objects, no RPC endpoints to manage. Ultra handles transaction sending, wallet balances, and token information via API.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">✓</span>
                <div>
                  <span className="font-medium text-white">Pre-built transactions:</span> Get optimized, base64-encoded transactions ready to sign. No manual transaction building or compute budget calculations.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">✓</span>
                <div>
                  <span className="font-medium text-white">Single API key:</span> Simple authentication. No infrastructure to host or maintain. Access to the same infrastructure powering jup.ag.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">✓</span>
                <div>
                  <span className="font-medium text-white">Production ready:</span> Same infrastructure powering jup.ag. Battle-tested at scale with 95% of swaps executing under 2 seconds.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Traditional vs Ultra V3</h2>
        
        <div className="space-y-6">
          {/* User Experience Comparison */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">User Experience</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-red-400 mb-3">Traditional</h4>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li>• Manual slippage settings</li>
                  <li>• Need SOL for gas fees</li>
                  <li>• 1-3 block wait time</li>
                  <li>• Higher MEV exposure</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-3">Ultra V3</h4>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li>• RTSE auto-calculates optimal slippage</li>
                  <li>• Gasless support (via JupiterZ or Gasless Support)</li>
                  <li>• Sub-second landing (0-1 block, ~50-400ms)</li>
                  <li>• 34x better MEV protection via Jupiter Beam</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Developer Experience Comparison */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Developer Experience</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-red-400 mb-3">Traditional</h4>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li>• RPC setup & management</li>
                  <li>• Manual transaction building & compute budget</li>
                  <li>• Complex quote aggregation & routing</li>
                  <li>• Infrastructure hosting & maintenance</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-400 mb-3">Ultra V3</h4>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li>• Just API calls</li>
                  <li>• Pre-built transactions</li>
                  <li>• Built-in routing</li>
                  <li>• Single API key</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Code Comparison */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Code Comparison</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Traditional (~50+ lines)</h4>
                <pre className="text-xs text-gray-500 bg-gray-950 p-3 rounded overflow-x-auto">
{`const connection = 
  new Connection(...);
const swap = 
  await createSwap(...);
const tx = new Transaction();
// ... 40+ more lines
// Manual routing
// Slippage calculation
// Transaction building`}
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Ultra V3 (3 lines)</h4>
                <pre className="text-xs text-green-400 bg-gray-950 p-3 rounded overflow-x-auto">
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
      </section>

      {/* Key Features */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">How It Works</h2>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">1. Get Quote</h4>
              <p>Call <code className="text-green-400 bg-gray-950 px-1 rounded">/ultra/v1/order</code> with input/output tokens and amount. No RPC needed.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">2. Sign Transaction</h4>
              <p>You receive a pre-built, optimized transaction. Just sign it with your wallet.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">3. Execute</h4>
              <p>Send signed transaction to <code className="text-green-400 bg-gray-950 px-1 rounded">/ultra/v1/execute</code>. Jupiter handles routing and execution.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">What Happens Behind the Scenes</h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-400 mt-2">
                <li>Predictive Execution simulates routes on-chain to verify executable price vs quoted price, selecting the route with least slippage</li>
                <li>RTSE (Real-Time Slippage Estimator) automatically calculates optimal slippage using token categories, historical data, and volatility patterns</li>
                <li>Jupiter Beam routes transactions through our own infrastructure for sub-second landing and MEV protection</li>
                <li>Gasless support automatically covers transaction fees when eligible (via JupiterZ RFQ or Gasless Support)</li>
                <li>Juno Liquidity Engine aggregates across Iris, JupiterZ, and third-party sources for best execution</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Getting Started</h2>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">1. Clone the Repository</h4>
              <p className="mb-2">See how this demo is built:</p>
              <pre className="bg-gray-950 p-3 rounded text-xs text-gray-300 overflow-x-auto mb-2">
                git clone https://github.com/0xanmol/Jupiter-UltraV3-Demo.git
              </pre>
              <p className="text-xs text-gray-400">Simple API calls, no RPC complexity. All the code is there.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">2. Get Your API Key</h4>
              <p className="mb-2">When you're ready to build, you'll need an API key:</p>
              <a 
                href="https://portal.jup.ag"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-sm transition-colors"
              >
                Jupiter Portal
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">3. Check Developer Mode</h4>
              <p>Open Developer Mode (bottom right button) to see live API calls, responses, and copy code snippets. This is how you'll learn what's happening.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

