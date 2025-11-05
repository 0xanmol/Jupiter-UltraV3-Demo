'use client';

interface InfoNavProps {
  activeView: 'swap' | 'learn';
  onViewChange: (view: 'swap' | 'learn') => void;
}

export function InfoNav({ activeView, onViewChange }: InfoNavProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <img src="/assets/logo-dark.svg" alt="Jupiter" className="w-8 h-8" />
            <span className="text-lg font-bold text-white">Ultra Swap Wizard</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onViewChange('swap')}
              className={`text-sm font-medium transition-colors ${
                activeView === 'swap'
                  ? 'text-green-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Swap
            </button>
            <button
              onClick={() => onViewChange('learn')}
              className={`text-sm font-medium transition-colors ${
                activeView === 'learn'
                  ? 'text-green-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Learn
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
