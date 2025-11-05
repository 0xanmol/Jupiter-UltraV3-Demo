export function extractRouterName(routePlan: any[] | undefined, swapType?: string): string {
  if (!routePlan || !Array.isArray(routePlan) || routePlan.length === 0) {
    return swapType || 'Meta Aggregation';
  }

  const firstRoute = routePlan[0];
  
  if (typeof firstRoute === 'string') {
    return firstRoute;
  }

  if (typeof firstRoute === 'object') {
    const routerName = firstRoute?.name || 
                      firstRoute?.label || 
                      firstRoute?.id || 
                      firstRoute?.router ||
                      firstRoute?.routerName ||
                      firstRoute?.source ||
                      firstRoute?.liquiditySource ||
                      (firstRoute?.swapInfo && firstRoute.swapInfo.label);
    
    if (routerName) {
      return routerName;
    }
  }

  return swapType || 'Meta Aggregation';
}

