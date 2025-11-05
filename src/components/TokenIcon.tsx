'use client';

import Image from 'next/image';

const TOKEN_ICONS: Record<string, string> = {
  'So11111111111111111111111111111111111111112': '/assets/solana-sol-logo.svg',
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': '/assets/usd-coin-usdc-logo.svg',
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': '/assets/usdt-svgrepo-com.svg',
};

interface TokenIconProps {
  mint: string;
  size?: number;
  className?: string;
}

export function TokenIcon({ mint, size = 32, className = '' }: TokenIconProps) {
  const iconPath = TOKEN_ICONS[mint];
  
  if (!iconPath) return null;

  return (
    <div className={`flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <Image
        src={iconPath}
        alt="token"
        width={size}
        height={size}
        className="rounded-full"
        style={{ width: 'auto', height: 'auto' }}
      />
    </div>
  );
}

