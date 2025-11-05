'use client';

export function ValueProposition() {
  return (
    <div className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border border-green-500/30 rounded-lg p-4">
      <div className="flex-1">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Why Jupiter Ultra V3?
        </h3>
        <p className="text-xs text-gray-300 mb-4">
          The simplest way to swap on Solana. Ultra handles everything so you don't have to.
        </p>

        <div className="space-y-4">
          {/* User Experience */}
          <div>
            <h4 className="text-xs font-semibold text-white mb-2">For Users:</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <svg className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <span className="font-medium text-gray-300">Better Prices:</span>
                  <span className="text-gray-400"> On average, Ultra delivers +0.63 bps positive slippage (more tokens than quoted). Predictive Execution simulates routes on-chain before execution.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <span className="font-medium text-gray-300">Lightning Fast:</span>
                  <span className="text-gray-400"> Sub-second landing (0-1 block, ~50-400ms). 50-66% faster than traditional methods (1-3 blocks, ~400ms-1.2s)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <span className="font-medium text-gray-300">Maximum Protection:</span>
                  <span className="text-gray-400"> 34x better MEV protection than top trading terminals via Jupiter Beam</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <span className="font-medium text-gray-300">Zero Complexity:</span>
                  <span className="text-gray-400"> No need to understand slippage, gas fees, or RPC endpoints</span>
                </div>
              </div>
            </div>
          </div>

          {/* Developer Experience */}
          <div className="border-t border-gray-700 pt-3">
            <h4 className="text-xs font-semibold text-white mb-2">For Developers:</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <svg className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <div>
                  <span className="font-medium text-gray-300">Zero RPC Complexity:</span>
                  <span className="text-gray-400"> No Connection setup, no RPC endpoints to manage</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <div>
                  <span className="font-medium text-gray-300">Pre-Built Transactions:</span>
                  <span className="text-gray-400"> Get optimized transactions ready to sign - no manual building</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <div>
                  <span className="font-medium text-gray-300">Single API Key:</span>
                  <span className="text-gray-400"> Simple authentication, no infrastructure to host or maintain</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <div>
                  <span className="font-medium text-gray-300">Production Ready:</span>
                  <span className="text-gray-400"> Same infrastructure powering jup.ag - battle-tested at scale</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
