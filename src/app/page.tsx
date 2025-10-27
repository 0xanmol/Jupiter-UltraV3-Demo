'use client';

import { UnifiedWalletProvider, UnifiedWalletButton } from '@jup-ag/wallet-adapter';
import { SwapWizard } from '../components/SwapWizard';

export default function Home() {
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
      <main className="min-h-screen relative bg-black">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-8 relative z-10 flex flex-col items-center justify-center min-h-screen">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img src="/logo-dark.svg" alt="Jupiter" className="w-12 h-12" />
              <span className="text-4xl font-bold text-white tracking-tight">
                Ultra Swap Wizard
              </span>
            </div>
            <p className="text-gray-500 font-light">
              Powered by Jupiter Ultra V3
            </p>
            
            <div className="mb-6 mt-4 flex justify-center">
              <UnifiedWalletButton />
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto w-full">
            <SwapWizard />
          </div>
          
          {/* Powered by Jupiter SVG */}
          <div className="mt-8 flex justify-center">
            <a 
              href="https://jup.ag" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group opacity-70 hover:opacity-100 transition-opacity"
            >
              <img 
                src="/poweredbyjupiter-dark.svg" 
                alt="Powered by Jupiter" 
                className="h-6"
              />
            </a>
          </div>
        </div>
      </main>
    </UnifiedWalletProvider>
  );
}
