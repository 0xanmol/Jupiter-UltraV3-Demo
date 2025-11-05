'use client';

import { useState } from 'react';
import { UnifiedWalletProvider, UnifiedWalletButton } from '@jup-ag/wallet-adapter';
import { SwapWizard } from '../components/SwapWizard';
import { InfoNav } from '../components/InfoNav';
import { LearnSection } from '../components/LearnSection';

export default function Home() {
  const [activeView, setActiveView] = useState<'swap' | 'learn'>('swap');

  return (
    <UnifiedWalletProvider
      wallets={[]}
      config={{
        autoConnect: false,
        env: "mainnet-beta",
        metadata: {
          name: "Ultra Swap Wizard",
          description: "Jupiter Ultra Swap API Demo",
          url: "http://localhost:3000",
          iconUrls: ["https://jup.ag/favicon.ico"],
        },
        theme: "dark",
        lang: "en",
      }}
    >
      <main className="min-h-screen relative bg-black flex flex-col">
        {/* Navigation */}
        <InfoNav activeView={activeView} onViewChange={setActiveView} />

        {/* Subtle gradient overlay */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="flex-1 container mx-auto px-4 py-8 relative z-10" style={{ paddingTop: 'calc(1rem + 56px)', minHeight: 'calc(100vh - 56px)' }}>
          {activeView === 'swap' ? (
            <div className="flex flex-col items-center justify-between min-h-full">
              {/* Wallet Connection */}
              <div className="flex justify-center w-full mb-4">
                <UnifiedWalletButton />
              </div>
              
              {/* Main Content - Swap Focus */}
              <div className="flex-1 flex items-center justify-center w-full py-8">
                <div className="max-w-2xl mx-auto w-full">
                  <SwapWizard />
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex justify-center mt-8 mb-4">
                <a 
                  href="https://jup.ag" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group opacity-70 hover:opacity-100 transition-opacity"
                >
                  <img 
                    src="/assets/poweredbyjupiter-dark.svg" 
                    alt="Powered by Jupiter" 
                    className="h-6"
                  />
                </a>
              </div>
            </div>
          ) : (
            <div className="py-8">
              <LearnSection />
              {/* Footer */}
              <div className="flex justify-center mt-12 mb-4">
                <a 
                  href="https://jup.ag" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group opacity-70 hover:opacity-100 transition-opacity"
                >
                  <img 
                    src="/assets/poweredbyjupiter-dark.svg" 
                    alt="Powered by Jupiter" 
                    className="h-6"
                  />
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </UnifiedWalletProvider>
  );
}
