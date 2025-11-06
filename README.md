# Ultra Swap Wizard

Reference implementation of Jupiter Ultra Swap API. Shows how to build swaps without managing RPC endpoints or transaction building.

## What This Does

Simple three-step swap flow:
1. Configure tokens and amount
2. Get quote with pre-built transaction
3. Sign and execute

## Why Ultra V3?

Traditional swaps need RPC setup, transaction building, compute budgets, slippage management. Ultra handles all of that.

**The Ultra way:**
```typescript
// Get quote
const quote = await fetch('https://api.jup.ag/ultra/v1/order?...');
// Sign and execute
const result = await fetch('https://api.jup.ag/ultra/v1/execute', ...);
```

That's it. No RPC, no transaction serialization, no infrastructure to manage.

## Quick Start

```bash
npm install
cp .env.example .env.local
# Add your API key from https://portal.jup.ag
npm run dev
```

## How It Works

### Getting a Quote

```typescript
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

You get back a base64-encoded transaction ready to sign, plus routing details, slippage, price impact - everything you need.

### Executing

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

Jupiter handles routing, execution, and polling. You get the result when it lands.

### Getting Balances

Use the `/holdings` endpoint instead of RPC:

```typescript
const response = await fetch(`https://api.jup.ag/ultra/v1/holdings/${walletAddress}`, {
  headers: { 'x-api-key': 'your-api-key' }
});
const data = await response.json();
const solBalance = data.uiAmountString;
```

## Developer Mode

Press Cmd/Ctrl + D (or click the bottom-right button) to open Developer Mode.

**API Logs tab:**
- All API calls logged automatically
- Click any request to see full payload
- JSON viewer with click-to-copy paths
- Replay requests (hover over any log entry)
- Transaction decoder for order responses

**Features tab:**
- Shows active Ultra V3 features (MEV Protection, Predictive Execution, RTSE, etc.)
- Router information (Iris, JupiterZ, Meta Aggregation)
- Execution results comparison

**Resources tab:**
- GitHub repo clone command
- Jupiter documentation links
- Quick code snippets

## What You'll See

**Step 2 (Quote):**
- Routing details showing which DEXes are used
- Price impact and slippage protection
- Router information

**Step 3 (Execute):**
- Quoted vs executed amount comparison
- Feature badges showing active protections
- Execution method and router details

If you see routing percentages that add up to more than 100%, that's multi-hop routing - your swap goes through multiple DEXes in sequence for better prices.

## Common Issues

**Insufficient balance** - Check your wallet balance before swapping.

**Transaction expired** - Sign and execute within about 60 seconds of getting the quote.

**No route found** - Try a different amount or token pair.

## API Endpoints Used

- `GET /ultra/v1/holdings/{address}` - Get wallet balances
- `GET /ultra/v1/order` - Get quote and transaction
- `POST /ultra/v1/execute` - Execute signed transaction

Get your API key at [portal.jup.ag](https://portal.jup.ag)

## Documentation

- [Ultra Swap Docs](https://dev.jup.ag/docs/ultra/index)
- [API Reference](https://dev.jup.ag/api-reference/ultra)
- [Ultra V3 Blog](https://dev.jup.ag/blog/ultra-v3)

## Security Note

This runs on Solana Mainnet. Real tokens will be swapped.

## License

MIT
