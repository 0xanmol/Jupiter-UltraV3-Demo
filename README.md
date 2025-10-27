# Ultra Swap Wizard

Reference implementation of the Jupiter Ultra Swap API, demonstrating the complete swap workflow.

## Overview

This demonstrates the complete swap workflow using Jupiter Ultra Swap API:

1. Configure swap parameters (tokens, amount, slippage)
2. Get quote with unsigned transaction from Jupiter
3. Sign and execute the swap

**Key Ultra V3 Benefits:**
- No RPC required - Jupiter handles all blockchain interactions
- Simplified balance fetching via `/holdings` endpoint
- Pre-built transactions ready to sign and submit
- Complete swap infrastructure without RPC complexity

## Architecture

```
src/
├── app/
│   ├── layout.tsx       # Root layout with UnifiedWalletProvider
│   ├── page.tsx         # Main page
│   └── globals.css      # Styles
├── components/
│   ├── SwapWizard.tsx   # Step management
│   ├── Step1Configure.tsx
│   ├── Step2Preview.tsx
│   ├── Step3Execute.tsx
│   ├── DeveloperMode.tsx
│   └── TokenIcon.tsx
└── hooks/
    └── useApiLogger.ts
```

## Getting Started

Install dependencies:
```bash
npm install
```

Run development server:
```bash
npm run dev
```

Open http://localhost:3000

## Jupiter API Integration

### Wallet Setup

Wrap app with UnifiedWalletProvider:

```typescript
import { UnifiedWalletProvider } from '@jup-ag/wallet-adapter';

<UnifiedWalletProvider config={{
  env: "mainnet-beta",
  autoConnect: false,
}}>
  {/* App */}
</UnifiedWalletProvider>
```

Access wallet state:
```typescript
const { publicKey, signTransaction } = useWallet();
```

### Getting a Quote

Convert amount to native units and request quote:

```typescript
const amountInNativeUnits = Math.floor(
  parseFloat(uiAmount) * Math.pow(10, tokenDecimals)
);

const url = new URL('https://api.jup.ag/ultra/v1/order');
url.searchParams.set('inputMint', inputMint);
url.searchParams.set('outputMint', outputMint);
url.searchParams.set('amount', amountInNativeUnits.toString());
url.searchParams.set('taker', publicKey.toBase58());

const response = await fetch(url.toString(), {
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key',
  },
});
const data = await response.json();
```

Response:
```typescript
{
  transaction: string;      // Base64 unsigned transaction
  requestId: string;         // Unique request ID
  outAmount: number;
  inAmount: number;
  slippageBps: number;
}
```

### Executing a Swap

Deserialize, sign, and submit:

```typescript
const transaction = VersionedTransaction.deserialize(
  Buffer.from(order.transaction, 'base64')
);
const signed = await signTransaction(transaction);
const signedBase64 = Buffer.from(signed.serialize()).toString('base64');

const response = await fetch('https://api.jup.ag/ultra/v1/execute', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key',
  },
  body: JSON.stringify({
    signedTransaction: signedBase64,
    requestId: order.requestId,
  }),
});
```

### Token Amount Conversion

```typescript
// UI to native units
const native = Math.floor(uiAmount * Math.pow(10, decimals));

// Native to UI
const ui = nativeAmount / Math.pow(10, decimals);
```

### Balance Fetching

Use Jupiter's `/holdings` endpoint - no RPC required:

```typescript
const response = await fetch(`https://api.jup.ag/ultra/v1/holdings/${walletAddress}`, {
  headers: {
    'x-api-key': 'your-api-key'
  }
});

const data = await response.json();
const solBalance = data.uiAmountString; // SOL balance as string
const usdcBalance = data.tokens['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v']?.uiAmountString; // Token balances
```

## Developer Mode

Press Cmd/Ctrl + D to open Developer Mode.

- Real-time API requests and responses
- Copyable code snippets
- Request timing and status codes

## Common Errors

**Insufficient balance**
- Check balance before submitting

**Transaction expired**
- Sign within ~60 seconds of getting quote

**No route available**
- Adjust amount or try different token pair

**403 Access forbidden**
- Use connection from useWallet hook

## API Endpoints

This demo uses the Jupiter Ultra Swap API with API key authentication. All requests are made to `https://api.jup.ag/ultra/v1/`.

**Implemented Endpoints:**
- `GET /ultra/v1/holdings/{address}` - Retrieve wallet token balances
- `GET /ultra/v1/order` - Get swap quote and unsigned transaction
- `POST /ultra/v1/execute` - Submit signed transaction for execution
- `GET /ultra/v1/order/routers` - List available routing engines

Get your API key at https://portal.jup.ag

## Security

This runs on Solana Mainnet. Real tokens will be swapped.

## Resources

- [Jupiter Documentation](https://docs.jup.ag)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT
