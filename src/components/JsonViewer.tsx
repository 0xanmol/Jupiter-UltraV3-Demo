'use client';

import { useState } from 'react';

interface JsonViewerProps {
  data: any;
  title?: string;
  className?: string;
}

interface JsonNodeProps {
  data: any;
  path: string;
  level: number;
  onCopyPath: (path: string, value: any) => void;
}

function JsonNode({ data, path, level, onCopyPath }: JsonNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyPath(path, data);
  };

  const indent = level * 16;

  if (data === null) {
    return (
      <div className="flex items-center" style={{ paddingLeft: `${indent}px` }}>
        <span className="text-gray-500">null</span>
        <button
          onClick={handleCopy}
          className="ml-2 text-gray-500 hover:text-green-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
          title={`Copy path: ${path}`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    );
  }

  if (typeof data === 'string') {
    return (
      <div className="flex items-center group" style={{ paddingLeft: `${indent}px` }}>
        <span className="text-green-400">"{data}"</span>
        <button
          onClick={handleCopy}
          className="ml-2 text-gray-500 hover:text-green-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
          title={`Copy path: ${path}`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    );
  }

  if (typeof data === 'number') {
    return (
      <div className="flex items-center group" style={{ paddingLeft: `${indent}px` }}>
        <span className="text-blue-400">{data}</span>
        <button
          onClick={handleCopy}
          className="ml-2 text-gray-500 hover:text-green-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
          title={`Copy path: ${path}`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    );
  }

  if (typeof data === 'boolean') {
    return (
      <div className="flex items-center group" style={{ paddingLeft: `${indent}px` }}>
        <span className="text-purple-400">{data.toString()}</span>
        <button
          onClick={handleCopy}
          className="ml-2 text-gray-500 hover:text-green-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
          title={`Copy path: ${path}`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    );
  }

  if (Array.isArray(data)) {
    return (
      <div style={{ paddingLeft: `${indent}px` }}>
        <div className="flex items-center group">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors mr-1"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <span className="text-gray-300">[</span>
          <span className="text-gray-500 ml-1">({data.length} items)</span>
          <span className="text-gray-300">]</span>
          <button
            onClick={handleCopy}
            className="ml-2 text-gray-500 hover:text-green-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
            title={`Copy path: ${path}`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          </button>
        </div>
        {isExpanded && (
          <div className="ml-4">
            {data.map((item, index) => (
              <JsonNode
                key={index}
                data={item}
                path={`${path}[${index}]`}
                level={level + 1}
                onCopyPath={onCopyPath}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data);
    return (
      <div style={{ paddingLeft: `${indent}px` }}>
        <div className="flex items-center group">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors mr-1"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <span className="text-gray-300">{'{'}</span>
          <span className="text-gray-500 ml-1">({keys.length} keys)</span>
          <span className="text-gray-300">{'}'}</span>
          <button
            onClick={handleCopy}
            className="ml-2 text-gray-500 hover:text-green-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
            title={`Copy path: ${path}`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          </button>
        </div>
        {isExpanded && (
          <div className="ml-4">
            {keys.map((key) => (
              <div key={key} className="group">
                <div className="flex items-center">
                  <span className="text-yellow-400">"{key}"</span>
                  <span className="text-gray-500 mx-2">:</span>
                  <JsonNode
                    data={data[key]}
                    path={path ? `${path}.${key}` : key}
                    level={level + 1}
                    onCopyPath={onCopyPath}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}

export function JsonViewer({ data, title, className = '' }: JsonViewerProps) {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const handleCopyPath = async (path: string, value: any) => {
    try {
      const pathToCopy = `data.${path}`;
      await navigator.clipboard.writeText(pathToCopy);
      setCopiedPath(pathToCopy);
      setTimeout(() => setCopiedPath(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className={`bg-gray-900 rounded-lg ${className}`}>
      {title && (
        <div className="px-3 py-2 border-b border-gray-800 flex items-center justify-between">
          <h4 className="text-sm font-medium text-white">{title}</h4>
          {copiedPath && (
            <span className="text-xs text-green-400">Copied: {copiedPath}</span>
          )}
        </div>
      )}
      <div className="p-3 font-mono text-sm overflow-x-auto">
        <JsonNode
          data={data}
          path=""
          level={0}
          onCopyPath={handleCopyPath}
        />
      </div>
    </div>
  );
}
