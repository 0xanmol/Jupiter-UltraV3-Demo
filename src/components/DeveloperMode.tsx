'use client';

import { useEffect, useState } from 'react';
import { ApiLogEntry } from '../hooks/useApiLogger';
import { JsonViewer } from './JsonViewer';
import { TransactionViewer } from './TransactionViewer';

interface DeveloperModeProps {
  logs: ApiLogEntry[];
  onClear: () => void;
  onOpen?: () => void;
  onReplayRequest?: (log: ApiLogEntry) => void;
}

export function DeveloperMode({ logs, onClear, onOpen, onReplayRequest }: DeveloperModeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ApiLogEntry | null>(null);
  const [hasTriggeredOnOpen, setHasTriggeredOnOpen] = useState(false);
  const [detailsHeight, setDetailsHeight] = useState(384); // Default h-96 (384px)
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'resources'>('logs');

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

  // Drag handlers for resizing details panel
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const viewportHeight = window.innerHeight;
      const newHeight = viewportHeight - e.clientY;
      const minHeight = 200;
      const maxHeight = viewportHeight * 0.8;
      
      setDetailsHeight(Math.max(minHeight, Math.min(maxHeight, newHeight)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  const handleDividerMouseDown = () => {
    setIsDragging(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

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

  const ResourcesPanel = () => (
    <div className="p-4 space-y-6">
      {/* GitHub Repository */}
      <div>
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Repository
        </h3>
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <code className="text-sm text-gray-300">git clone https://github.com/0xanmol/Jupiter-UltraV3-Demo.git</code>
            <button
              onClick={() => copyToClipboard('git clone https://github.com/0xanmol/Jupiter-UltraV3-Demo.git')}
              className="text-xs text-green-500 hover:text-green-400 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Jupiter Documentation */}
      <div>
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Jupiter Ultra Swap Documentation
        </h3>
        <div className="space-y-2">
          <a
            href="https://dev.jup.ag/docs/ultra/index"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Ultra Swap Overview</span>
              <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
          <a
            href="https://dev.jup.ag/docs/ultra/get-started"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Get Started Guide</span>
              <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
          <a
            href="https://dev.jup.ag/api-reference/ultra"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">API Reference</span>
              <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
          <a
            href="https://dev.jup.ag/blog/ultra-v3"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Ultra V3 Technical Deep Dive</span>
              <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
        </div>
      </div>

      {/* Portal & API Key */}
      <div>
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          API Key & Portal
        </h3>
        <div className="space-y-2">
          <a
            href="https://portal.jup.ag"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Jupiter Portal (Get API Key)</span>
              <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
        </div>
      </div>

      {/* Quick Integration Snippets */}
      <div>
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Quick Integration
        </h3>
        <div className="space-y-3">
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase">Basic Quote Request</span>
              <button
                onClick={() => copyToClipboard(`const response = await fetch('https://api.jup.ag/ultra/v1/order?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1000000000&taker=YOUR_WALLET_ADDRESS', {
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY',
  },
});`)}
                className="text-xs text-green-500 hover:text-green-400 transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="text-xs text-gray-300 overflow-x-auto">
{`const response = await fetch(
  'https://api.jup.ag/ultra/v1/order?' +
  'inputMint=So11111111111111111111111111111111111111112&' +
  'outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&' +
  'amount=1000000000&' +
  'taker=YOUR_WALLET_ADDRESS',
  {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY',
    },
  }
);`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );

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

      {/* Tab Switcher */}
      <div className="border-b border-gray-800">
        <div className="flex">
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'logs'
                ? 'text-white border-b-2 border-green-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            API Logs {logs.length > 0 && `(${logs.length})`}
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'resources'
                ? 'text-white border-b-2 border-green-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Resources
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'logs' ? (
          logs.length === 0 ? (
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
                <div
                  key={log.id}
                  className={`group hover:bg-gray-900 transition-colors ${
                    selectedLog?.id === log.id ? 'bg-gray-900 border-l-2 border-green-500' : ''
                  }`}
                >
                  <button
                    onClick={() => setSelectedLog(log)}
                    className="w-full text-left p-3"
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
                  {onReplayRequest && (
                    <div className="px-3 pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReplayRequest(log);
                        }}
                        className="text-xs text-green-500 hover:text-green-400 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Replay Request
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          <ResourcesPanel />
        )}
      </div>

      {selectedLog && (
        <>
          {/* Draggable divider */}
          <div
            onMouseDown={handleDividerMouseDown}
            className={`border-t border-gray-800 cursor-ns-resize hover:border-gray-600 transition-colors ${
              isDragging ? 'border-gray-500' : ''
            }`}
            style={{ height: '8px' }}
          >
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-1 bg-gray-600 rounded-full hover:bg-gray-500 transition-colors"></div>
            </div>
          </div>
          
          <div 
            className="overflow-y-auto bg-gray-900/50"
            style={{ height: `${detailsHeight}px` }}
          >
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
                <JsonViewer data={selectedLog.request.headers} />
              </div>
            )}

            {selectedLog.request.body && (
              <div>
                <label className="text-xs text-gray-500 uppercase mb-2 block">Request Body</label>
                <JsonViewer data={selectedLog.request.body} />
              </div>
            )}

            <div>
              <label className="text-xs text-gray-500 uppercase mb-2 block">Response</label>
              <div className="bg-gray-900 rounded-lg">
                <div className="px-3 py-2 border-b border-gray-800 flex items-center gap-2">
                  <span className={`text-xs font-medium ${getStatusColor(selectedLog.response.status)}`}>
                    Status: {selectedLog.response.status} {selectedLog.response.statusText}
                  </span>
                  <span className="text-xs text-gray-500">({selectedLog.response.timing}ms)</span>
                </div>
                <JsonViewer data={selectedLog.response.data} />
              </div>
            </div>

            {/* Transaction Decoder for Order responses */}
            {selectedLog.url.includes('/ultra/v1/order') && 
             selectedLog.response.data?.transaction && 
             selectedLog.response.status === 200 && (
              <div>
                <label className="text-xs text-gray-500 uppercase mb-2 block">Transaction Decoder</label>
                <TransactionViewer base64Transaction={selectedLog.response.data.transaction} />
              </div>
            )}

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
        </>
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
