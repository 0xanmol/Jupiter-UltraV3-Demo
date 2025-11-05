'use client';

import { ApiLogEntry } from '../hooks/useApiLogger';
import { OrderResponse } from './SwapWizard';
import { extractRouterName } from '../utils/routerExtractor';

interface FeaturesPanelProps {
  logs: ApiLogEntry[];
}

interface FeatureStatus {
  name: string;
  active: boolean;
  description: string;
  icon: React.ReactNode;
}

export function FeaturesPanel({ logs }: FeaturesPanelProps) {
  const orderLog = logs
    .filter(log => log.url.includes('/ultra/v1/order') && log.response.status === 200)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

  const executeLog = logs
    .filter(log => log.url.includes('/ultra/v1/execute') && log.response.status === 200)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

  const orderData = orderLog?.response.data as OrderResponse | undefined;
  const executeData = executeLog?.response.data;

  const features: FeatureStatus[] = [
    {
      name: 'MEV Protection',
      active: true,
      description: 'Jupiter Beam ensures transactions are sent via our own infrastructure, minimizing exposure to front-running and sandwich attacks.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      name: 'Predictive Execution',
      active: true,
      description: 'Routes are simulated on-chain before execution to verify actual vs quoted price.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      name: 'RTSE Optimized',
      active: orderData?.slippageBps !== undefined && orderData.slippageBps !== null,
      description: 'Real-Time Slippage Estimator uses token-specific heuristics to calculate optimal slippage.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'Meta Aggregation',
      active: orderData?.routePlan && orderData.routePlan.length > 0,
      description: 'Compares multiple routers (Iris, JupiterZ, OKX, Dflow, Hashflow) to find the best price.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      name: 'Jupiter Beam',
      active: executeLog !== undefined,
      description: 'Sub-second transaction landing (50-66% faster than traditional methods).',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      name: 'Iris Router',
      active: extractRouterName(orderData?.routePlan, orderData?.swapType) === 'Iris',
      description: 'Ultra-exclusive router with 0.01% granular splitting. 100x performance improvements.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'JupiterZ Router',
      active: extractRouterName(orderData?.routePlan, orderData?.swapType) === 'JupiterZ',
      description: 'RFQ engine with zero slippage execution. ~$100M daily volume. Gasless by default.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const quoteTime = orderLog?.response.timing;
  const executeTime = executeLog?.response.timing;
  const totalTime = quoteTime && executeTime ? quoteTime + executeTime : undefined;
  const executedBetter = executeData && orderData?.outAmount && 
    (executeData.executedOutAmount || executeData.outAmount) > orderData.outAmount;

  return (
    <div className="space-y-4">
      {!orderLog && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No swap data available. Perform a swap to see Ultra V3 features in action.
        </div>
      )}

      {orderLog && (
        <>
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Active Features</h3>
            <div className="space-y-2">
              {features.filter(f => f.active).map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <div className="text-gray-400 mt-0.5">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{feature.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(quoteTime || executeTime) && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Performance</h3>
              <div className="space-y-2">
                {quoteTime && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Quote Latency</span>
                    <span className="text-white font-medium">{quoteTime}ms</span>
                  </div>
                )}
                {executeTime && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Execute Latency</span>
                    <span className="text-white font-medium">{executeTime}ms</span>
                  </div>
                )}
                {totalTime && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Time</span>
                    <span className="text-white font-medium">{totalTime}ms</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {orderData && (() => {
            const routerName = extractRouterName(orderData.routePlan, orderData.swapType);
            return (
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Router</h3>
                <div className="text-sm">
                  <div className="text-white font-medium">{routerName}</div>
                  {routerName === 'Iris' && (
                    <div className="text-xs text-gray-400 mt-1">0.01% granular splitting</div>
                  )}
                  {routerName === 'JupiterZ' && (
                    <div className="text-xs text-gray-400 mt-1">Zero slippage execution</div>
                  )}
                </div>
              </div>
            );
          })()}

          {executedBetter && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Execution</h3>
              <div className="text-sm text-white">
                Better than quoted • Predictive Execution delivered improved price
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

