import { useState, useCallback } from 'react';

export interface ApiLogEntry {
  id: string;
  timestamp: Date;
  method: string;
  url: string;
  request: {
    headers?: Record<string, string>;
    body?: any;
  };
  response: {
    status: number;
    statusText: string;
    data?: any;
    error?: string;
    timing: number; // in milliseconds
  };
}

interface UseApiLoggerReturn {
  logs: ApiLogEntry[];
  addLog: (entry: Omit<ApiLogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  getLogsByUrl: (url: string) => ApiLogEntry[];
}

export function useApiLogger(): UseApiLoggerReturn {
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);

  const addLog = useCallback((entry: Omit<ApiLogEntry, 'id' | 'timestamp'>) => {
    const newLog: ApiLogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setLogs(prev => [...prev, newLog]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const getLogsByUrl = useCallback((url: string) => {
    return logs.filter(log => log.url.includes(url));
  }, [logs]);

  return {
    logs,
    addLog,
    clearLogs,
    getLogsByUrl,
  };
}

