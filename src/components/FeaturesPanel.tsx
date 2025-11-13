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
    },
    {
      name: 'Predictive Execution',
      active: true,
      description: 'Routes are simulated on-chain before execution to verify actual vs quoted price.',
    },
    {
      name: 'RTSE Optimized',
      active: orderData?.slippageBps !== undefined && orderData.slippageBps !== null,
      description: 'Real-Time Slippage Estimator uses token-specific heuristics to calculate optimal slippage.',
    },
    {
      name: 'Meta Aggregation',
      active: !!(orderData?.routePlan && orderData.routePlan.length > 0),
      description: 'Compares multiple routers (Iris, JupiterZ, OKX, Dflow, Hashflow) to find the best price.',
    },
    {
      name: 'Jupiter Beam',
      active: executeLog !== undefined,
      description: 'Sub-second transaction landing (50-66% faster than traditional methods).',
    },
    {
      name: 'Iris Router',
      active: extractRouterName(orderData?.routePlan, orderData?.swapType) === 'Iris',
      description: 'Ultra-exclusive router with 0.01% granular splitting. 100x performance improvements.',
    },
    {
      name: 'JupiterZ Router',
      active: extractRouterName(orderData?.routePlan, orderData?.swapType) === 'JupiterZ',
      description: 'RFQ engine with zero slippage execution. ~$100M daily volume. Gasless by default.',
    },
  ];

  const quoteTime = orderLog?.response.timing;
  const executeTime = executeLog?.response.timing;
  const totalTime = quoteTime && executeTime ? quoteTime + executeTime : undefined;
  const executedBetter = executeData && orderData?.outAmount && 
    (executeData.executedOutAmount || executeData.outAmount) > orderData.outAmount;

  return (
    <div className="space-y-6">
      {!orderLog && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No swap data available. Perform a swap to see Ultra V3 features in action.
        </div>
      )}

      {orderLog && (
        <>
          <div className="border-b border-gray-800 pb-4">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-4">Active Features</h3>
            <div className="space-y-4">
              {features.filter(f => f.active).map((feature, idx) => (
                <div key={idx}>
                  <div className="text-sm text-white font-medium mb-1">{feature.name}</div>
                  <div className="text-xs text-gray-400 leading-relaxed">{feature.description}</div>
                </div>
              ))}
            </div>
          </div>


          {orderData && (() => {
            const uniqueRouters = orderData.routePlan && Array.isArray(orderData.routePlan) && orderData.routePlan.length > 0
              ? Array.from(new Set(
                  orderData.routePlan.map((route: any) => extractRouterName([route])).filter(Boolean)
                ))
              : [];
            
            return uniqueRouters.length > 0 ? (
              <div className="border-b border-gray-800 pb-4">
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-4">
                  {uniqueRouters.length > 1 ? 'Routers' : 'Router'}
                </h3>
                <div className="space-y-3">
                  {uniqueRouters.map((routerName, idx) => (
                    <div key={idx}>
                      <div className="text-sm text-white font-medium">{routerName}</div>
                      {routerName === 'Iris' && (
                        <div className="text-xs text-gray-400 mt-1">0.01% granular splitting</div>
                      )}
                      {routerName === 'JupiterZ' && (
                        <div className="text-xs text-gray-400 mt-1">Zero slippage execution</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          {executedBetter && (
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-4">Execution</h3>
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

