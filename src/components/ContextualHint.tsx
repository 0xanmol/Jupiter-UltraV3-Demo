'use client';

import { useState } from 'react';

interface ContextualHintProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'info' | 'success' | 'learning';
}

export function ContextualHint({ title, description, actionLabel, onAction, variant = 'info' }: ContextualHintProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const variantStyles = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    success: 'bg-green-500/10 border-green-500/30 text-green-300',
    learning: 'bg-purple-500/10 border-purple-500/30 text-purple-300'
  };

  return (
    <div className={`mb-4 p-3 rounded-lg border ${variantStyles[variant]} animate-slide-in-up`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {variant === 'info' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
              {variant === 'success' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
              {variant === 'learning' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              )}
            </svg>
            <h4 className="text-xs font-semibold">{title}</h4>
          </div>
          <p className="text-xs leading-relaxed">{description}</p>
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="mt-2 text-xs font-medium underline hover:no-underline transition-all"
            >
              {actionLabel} →
            </button>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-current/60 hover:text-current transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

