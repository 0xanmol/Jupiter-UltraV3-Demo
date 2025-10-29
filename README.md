# Ultra Swap Wizard

Reference implementation of the Jupiter Ultra Swap API, demonstrating the complete swap workflow.

## Overview

This demonstrates the complete swap workflow using Jupiter Ultra Swap API:

1. Configure swap parameters (tokens, amount, slippage)
2. Get quote with unsigned transaction from Jupiter
3. Sign and execute the swap

## Why Ultra V3?

### The Traditional Way ❌
```typescript
// You need to:
// 1. Set up RPC provider
const connection = new Connection('https://api.mainnet-beta.solana.com');
// 2. Build transaction yourself
// 3. Calculate accounts, compute budget, etc.
// 4. Handle quote refresh
// 5. Manage slippage manually
// 6. Handle errors from multiple sources
```

### The Ultra V3 Way ✅
```typescript
// Jupiter handles everything for you:
// 1. Get quote with pre-built transaction
const quote = await fetch('https://api.jup.ag/ultra/v1/order?...');
// 2. Sign it
const signed = await signTransaction(transaction);
// 3. Submit it
const result = await fetch('https://api.jup.ag/ultra/v1/execute', ...);
```

**Key Ultra V3 Benefits:**
- ✅ **Zero RPC complexity** - No need for Solana RPC endpoints
- ✅ **Pre-built transactions** - Jupiter creates optimized transactions ready to sign
- ✅ **Simplified balance fetching** - Use `/holdings` endpoint instead of RPC calls
- ✅ **Built-in routing** - Automatic DEX aggregation and route optimization
- ✅ **Production ready** - Handles all edge cases (insufficient liquidity, slippage, etc.)
- ✅ **Single API key** - Simple authentication, no infrastructure needed

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

Set up your API key:
1. Copy `.env.example` to `.env.local`
2. Get your API key from [Jupiter Portal](https://portal.jup.ag)
3. Add your API key to `.env.local`

```bash
cp .env.example .env.local
# Then edit .env.local with your API key
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

### Features

**API Logs Tab:**
- Real-time API requests and responses
- Interactive JSON viewer with click-to-copy paths
- Request timing and status codes
- Request replay functionality
- Resizable request details panel

**Resources Tab:**
- GitHub repository clone command
- Jupiter Ultra Swap documentation links
- Portal access for API keys
- Quick integration code snippets

**Transaction Decoder:**
- Decode base64 transactions from order responses
- View instruction details and program IDs
- Account information with signer/writable flags
- Copy addresses and signatures

### Usage

1. **Viewing API Calls**: All Jupiter API calls are automatically logged with full request/response details
2. **JSON Path Copy**: Click any field in the JSON viewer to copy its path (e.g., `data.outAmount`)
3. **Request Replay**: Hover over any log entry and click "Replay Request" to resend with original parameters
4. **Transaction Inspection**: For order responses, use the Transaction Decoder to see what the transaction actually does
5. **Resources**: Switch to Resources tab for quick access to documentation and code examples

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

### Jupiter Documentation
- [Ultra Swap Overview](https://dev.jup.ag/docs/ultra/index) - Complete Ultra Swap API documentation
- [Get Started Guide](https://dev.jup.ag/docs/ultra/get-started) - Step-by-step integration guide
- [API Reference](https://dev.jup.ag/api-reference/ultra) - Complete API endpoint documentation
- [Ultra V3 Technical Deep Dive](https://dev.jup.ag/blog/ultra-v3) - Technical blog post on Ultra V3 features
- [Jupiter Portal](https://portal.jup.ag) - Get your API key

### Developer Tools
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/) - Solana JavaScript SDK
- [Next.js Documentation](https://nextjs.org/docs) - React framework documentation
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework

## License

MIT
