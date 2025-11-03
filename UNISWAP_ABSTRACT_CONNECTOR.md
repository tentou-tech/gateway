# Uniswap-Abstract Connector Documentation

## Overview

The `uniswap-abstract` connector is a dedicated connector that provides Uniswap Universal Router access exclusively on the **Abstract network**. This allows Hummingbot strategies to explicitly target Abstract without specifying the network parameter.

## Purpose

This connector was created to enable arbitrage between:
- `uniswap/router` (defaults to Ethereum mainnet)
- `uniswap-abstract/router` (locked to Abstract network)

## Key Features

- **Network Locked**: Always uses Abstract network (no network parameter needed)
- **Router Only**: Supports Universal Router operations (quote-swap, execute-quote, execute-swap)
- **Shared Logic**: Reuses existing Uniswap implementation for consistency
- **Separate Configuration**: Independent slippage and hop settings

## API Endpoints

All endpoints are prefixed with `/connectors/uniswap-abstract/router`

### 1. GET /quote-swap

Get a swap quote on Abstract network.

**Query Parameters:**
```typescript
{
  walletAddress?: string,  // Optional, uses default wallet if not provided
  baseToken: string,       // Base token symbol (e.g., "WETH")
  quoteToken: string,      // Quote token symbol (e.g., "USDC")
  amount: number,          // Amount to swap
  side: "BUY" | "SELL",   // Trade side
  slippagePct?: number    // Optional, uses config default (2%)
}
```

**Response:**
```typescript
{
  quoteId: string,
  tokenIn: string,
  tokenOut: string,
  amountIn: number,
  amountOut: number,
  price: number,
  priceImpactPct: number,
  minAmountOut: number,
  maxAmountIn: number,
  routePath: string
}
```

**Example:**
```bash
curl "http://localhost:15888/connectors/uniswap-abstract/router/quote-swap?baseToken=WETH&quoteToken=USDC&amount=1&side=SELL"
```

### 2. POST /execute-quote

Execute a previously generated quote.

**Request Body:**
```typescript
{
  walletAddress?: string,  // Optional
  quoteId: string         // Quote ID from quote-swap
}
```

**Response:**
```typescript
{
  txHash: string,
  status: "success" | "failed",
  ...
}
```

**Example:**
```bash
curl -X POST http://localhost:15888/connectors/uniswap-abstract/router/execute-quote \
  -H "Content-Type: application/json" \
  -d '{"quoteId": "abc-123-def"}'
```

### 3. POST /execute-swap

Quote and execute a swap in one step.

**Request Body:**
```typescript
{
  walletAddress: string,
  baseToken: string,
  quoteToken: string,
  amount: number,
  side: "BUY" | "SELL",
  slippagePct: number
}
```

**Response:**
```typescript
{
  txHash: string,
  status: "success" | "failed",
  ...
}
```

**Example:**
```bash
curl -X POST http://localhost:15888/connectors/uniswap-abstract/router/execute-swap \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x...",
    "baseToken": "WETH",
    "quoteToken": "USDC",
    "amount": 1,
    "side": "SELL",
    "slippagePct": 2
  }'
```

## Configuration

**File:** `src/templates/connectors/uniswap-abstract.yml`

```yaml
# Default slippage percentage for swaps (2%)
slippagePct: 2

# Maximum number of hops to consider
maximumHops: 4
```

**To modify:**
1. Edit the YAML file above
2. Restart Gateway
3. Changes apply to all `uniswap-abstract` operations

## Network Behavior

| Connector | Default Network | Network Parameter | Can Override? |
|-----------|----------------|-------------------|---------------|
| `uniswap/router` | mainnet | Optional | ✅ Yes |
| `uniswap-abstract/router` | abstract | N/A | ❌ No (locked) |

The `uniswap-abstract` connector **always** uses the Abstract network, regardless of any network parameter provided.

## Use Cases

### 1. Cross-Chain Arbitrage

Use Hummingbot to arbitrage between Ethereum mainnet and Abstract:

```yaml
# Example Hummingbot strategy
exchange_1: uniswap/router      # Uses Ethereum mainnet
exchange_2: uniswap-abstract/router  # Uses Abstract
```

### 2. Abstract-Specific Trading

Target Abstract exclusively without worrying about network parameters:

```bash
# No network parameter needed!
curl "http://localhost:15888/connectors/uniswap-abstract/router/quote-swap?baseToken=WETH&quoteToken=USDC&amount=1&side=SELL"
```

### 3. Multi-Connector Strategies

Run strategies that trade on multiple networks simultaneously:
- `uniswap/router` on Ethereum
- `uniswap-abstract/router` on Abstract
- `pancakeswap/router` on BSC

## File Structure

```
src/connectors/uniswap-abstract/
├── uniswap-abstract.config.ts      # Connector configuration
├── uniswap-abstract.routes.ts      # Route registration
└── router-routes/
    ├── index.ts                    # Route exports
    ├── quoteSwap.ts               # Quote generation
    ├── executeQuote.ts            # Quote execution
    └── executeSwap.ts             # One-step swap

src/templates/
├── connectors/
│   └── uniswap-abstract.yml       # User configuration
└── namespace/
    └── uniswap-abstract-schema.json  # Schema validation
```

## Differences from Regular Uniswap Connector

| Feature | `uniswap` | `uniswap-abstract` |
|---------|-----------|-------------------|
| Networks | Multi-network | Abstract only |
| Trading Types | Router, AMM, CLMM | Router only |
| Network Param | Required/Optional | Ignored (always abstract) |
| Config Namespace | `uniswap.*` | `uniswap-abstract.*` |
| Routes | `/connectors/uniswap/*` | `/connectors/uniswap-abstract/*` |

## Testing

### 1. Check Connector Status

```bash
curl http://localhost:15888/config/connectors
```

Should show `uniswap-abstract` in the list.

### 2. Test Quote Generation

```bash
curl "http://localhost:15888/connectors/uniswap-abstract/router/quote-swap?baseToken=WETH&quoteToken=USDC&amount=0.1&side=SELL"
```

### 3. Verify Network

Check the logs to confirm it's using Abstract:
```
[uniswap-abstract/quote-swap] Forcing network to 'abstract'
```

## Integration with Hummingbot

When configuring Hummingbot strategies, use the connector name:

```yaml
connector: uniswap-abstract/router
```

The `/router` suffix is required to specify the trading type (router vs amm vs clmm).

## Troubleshooting

### Error: "Token not found"

Make sure tokens are configured in `src/templates/tokens/ethereum/abstract.json`

### Error: "Uniswap V3 SwapRouter02 address not configured"

Verify Uniswap contract addresses are set in `src/connectors/uniswap/uniswap.contracts.ts` for the `abstract` network.

### Wrong Network Used

The connector should always use Abstract. If you see a different network:
1. Check the logs for `[uniswap-abstract/*]` prefixes
2. Verify routes are registered at `/connectors/uniswap-abstract/*`
3. Rebuild the project: `pnpm build`

## Implementation Notes

### Code Reuse

The connector reuses the existing Uniswap logic:
- Imports `quoteSwap` from `../../uniswap/router-routes/quoteSwap`
- Imports `executeQuote` from `../../uniswap/router-routes/executeQuote`
- Wraps calls with hardcoded `network = 'abstract'`

This ensures:
- ✅ Consistency with regular Uniswap connector
- ✅ Automatic updates when Uniswap logic changes
- ✅ Less code duplication
- ✅ Easier maintenance

### Route Registration

Routes are registered in `src/app.ts`:
```typescript
app.register(uniswapAbstractRoutes.router, {
  prefix: '/connectors/uniswap-abstract/router',
});
```

### Swagger/OpenAPI

All routes are tagged with `/connector/uniswap-abstract` for API documentation.

View docs at: `http://localhost:15888/docs`

## Future Enhancements

Possible improvements:
1. Add AMM (V2) support if needed
2. Add CLMM (V3) support for liquidity provision
3. Add position management routes
4. Add multi-network variants (e.g., `uniswap-polygon`, `uniswap-arbitrum`)

## Related Files

- Abstract chain config: `src/templates/chains/ethereum/abstract.yml`
- Abstract tokens: `src/templates/tokens/ethereum/abstract.json`
- Uniswap contracts: `src/connectors/uniswap/uniswap.contracts.ts`
- Root config: `src/templates/root.yml`

## Support

For issues or questions:
1. Check logs for `[uniswap-abstract/*]` messages
2. Verify Abstract chain configuration is complete
3. Test with regular `uniswap/router` first to isolate issues
4. Review ABSTRACT_CHAIN_SETUP.md for chain configuration

---

**Created:** $(date)
**Connector:** uniswap-abstract
**Version:** 1.0.0
