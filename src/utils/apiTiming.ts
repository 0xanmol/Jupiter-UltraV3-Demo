export interface TimedApiResponse<T> {
  response: T;
  timeElapsed: number;
  timestamp: number;
}

export async function timedApiCall<T>(
  apiCall: () => Promise<T>
): Promise<TimedApiResponse<T>> {
  const timestampStart = Date.now();
  const response = await apiCall();
  const timestampEnd = Date.now();
  
  return {
    response,
    timeElapsed: timestampEnd - timestampStart,
    timestamp: timestampEnd,
  };
}

