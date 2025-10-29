'use client';

import { useEffect, useState } from 'react';
import { ApiLogEntry } from '../hooks/useApiLogger';

interface DeveloperModeProps {
  logs: ApiLogEntry[];
  onClear: () => void;
  onOpen?: () => void;
}

export function DeveloperMode({ logs, onClear, onOpen }: DeveloperModeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ApiLogEntry | null>(null);
  const [hasTriggeredOnOpen, setHasTriggeredOnOpen] = useState(false);

  // Call onOpen callback when panel opens for the first time
  useEffect(() => {
    if (isOpen && !hasTriggeredOnOpen) {
      onOpen?.();
      setHasTriggeredOnOpen(true);
    }
  }, [isOpen, hasTriggeredOnOpen, onOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-400';
    if (status >= 400 && status < 500) return 'text-yellow-400';
    if (status >= 500) return 'text-red-400';
    return 'text-gray-400';
  };

  const generateCodeSnippet = (log: ApiLogEntry, format: 'fetch' | 'curl' | 'axios') => {
    const { method, url, request, response } = log;
    const hasBody = request.body && Object.keys(request.body).length > 0;

    switch (format) {
      case 'fetch':
        const fetchBody = hasBody ? `,\n  body: JSON.stringify(${JSON.stringify(request.body, null, 2)})` : '';
        return `const response = await fetch('${url}', {
  method: '${method}',
  headers: {
${Object.entries(request.headers || {}).map(([k, v]) => `    '${k}': '${v}'`).join(',\n')}
  }${fetchBody}
});`;

      case 'curl':
        const headers = Object.entries(request.headers || {})
          .map(([k, v]) => `-H '${k}: ${v}'`)
          .join(' \\\n  ');
        const curlBody = hasBody ? ` \\\n  -d '${JSON.stringify(request.body)}'` : '';
        return `curl -X ${method} '${url}' \\\n  ${headers}${curlBody}`;

      case 'axios':
        const axiosBody = hasBody ? `,\n  data: ${JSON.stringify(request.body, null, 2)}` : '';
        return `const response = await axios.${method.toLowerCase()}('${url}', {
  headers: {
${Object.entries(request.headers || {}).map(([k, v]) => `    '${k}': '${v}'`).join(',\n')}
  }${axiosBody}
});`;

      default:
        return '';
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg text-white text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Developer Mode
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 z-50 flex flex-col bg-gray-950 border-l border-gray-800 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">Developer Mode</h2>
          {logs.length > 0 && (
            <span className="text-xs text-green-500 px-2 py-1 bg-green-500/10 rounded">
              {logs.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <p className="text-xs">No API requests yet</p>
            <p className="text-xs mt-1 text-gray-600">Make a swap to see calls</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {logs.map((log) => (
              <button
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className={`w-full text-left p-3 hover:bg-gray-900 transition-colors ${
                  selectedLog?.id === log.id ? 'bg-gray-900 border-l-2 border-green-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <code className="text-xs text-gray-400">{log.method}</code>
                  <span className={`text-xs font-medium ${getStatusColor(log.response.status)}`}>
                    {log.response.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {new URL(log.url).pathname}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {log.timestamp.toLocaleTimeString()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedLog && (
        <div className="border-t border-gray-800 h-96 overflow-y-auto bg-gray-900/50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
            <h3 className="text-sm font-medium text-white">Request Details</h3>
            <button
              onClick={() => setSelectedLog(null)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase mb-2 block">Endpoint</label>
              <code className="block p-3 bg-gray-900 rounded text-green-400 text-sm break-all">
                {selectedLog.method} {selectedLog.url}
              </code>
            </div>

            {Object.keys(selectedLog.request.headers || {}).length > 0 && (
              <div>
                <label className="text-xs text-gray-500 uppercase mb-2 block">Headers</label>
                <pre className="p-3 bg-gray-900 rounded text-xs text-gray-300 overflow-x-auto">
                  {JSON.stringify(selectedLog.request.headers, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.request.body && (
              <div>
                <label className="text-xs text-gray-500 uppercase mb-2 block">Request Body</label>
                <pre className="p-3 bg-gray-900 rounded text-xs text-gray-300 overflow-x-auto">
                  {JSON.stringify(selectedLog.request.body, null, 2)}
                </pre>
              </div>
            )}

            <div>
              <label className="text-xs text-gray-500 uppercase mb-2 block">Response</label>
              <div className="p-3 bg-gray-900 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium ${getStatusColor(selectedLog.response.status)}`}>
                    Status: {selectedLog.response.status} {selectedLog.response.statusText}
                  </span>
                  <span className="text-xs text-gray-500">({selectedLog.response.timing}ms)</span>
                </div>
                <pre className="text-xs text-gray-300 overflow-x-auto">
                  {JSON.stringify(selectedLog.response.data, null, 2)}
                </pre>
              </div>
            </div>

            {selectedLog.response.error && (
              <div>
                <label className="text-xs text-gray-500 uppercase mb-2 block">Error</label>
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
                  {selectedLog.response.error}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-gray-500 uppercase mb-2 block">Code Snippets</label>
              <div className="space-y-2">
                {['fetch', 'curl', 'axios'].map((format) => (
                  <div key={format} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500 uppercase">{format}</span>
                      <button
                        onClick={() => {
                          const code = generateCodeSnippet(selectedLog, format as any);
                          navigator.clipboard.writeText(code);
                        }}
                        className="text-xs text-green-500 hover:text-green-400"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="p-3 bg-gray-900 rounded text-xs text-gray-300 overflow-x-auto">
                      {generateCodeSnippet(selectedLog, format as any)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <div className="border-t border-gray-800 p-3">
          <button
            onClick={onClear}
            className="w-full px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded hover:bg-red-500/20 transition-colors"
          >
            Clear History
          </button>
        </div>
      )}
    </div>
  );
}
