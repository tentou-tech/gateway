# Abstract Chain Integration - Setup Guide

All required files have been created for the Abstract chain integration. You need to fill in the placeholders with the correct values.

## Files Created/Modified

### 1. Network Configuration
**File:** `src/templates/chains/ethereum/abstract.yml`

```yaml
chainID: 0  # TODO: Replace with Abstract chain ID
nodeURL: https://rpc.abstract.xyz  # TODO: Replace with official RPC endpoint
nativeCurrencySymbol: ETH  # TODO: Update if different
minGasPrice: 0.01  # TODO: Adjust based on Abstract's gas prices
```

**What you need:**
- **chainID**: The unique chain ID for Abstract (e.g., check Abstract's documentation or Chainlist.org)
- **nodeURL**: Official public RPC endpoint URL
- **nativeCurrencySymbol**: Usually ETH for L2s, but check Abstract's docs
- **minGasPrice**: Typical minimum gas price in GWEI

### 2. Token List
**File:** `src/templates/tokens/ethereum/abstract.json`

Currently has placeholders for common tokens (WETH, USDC, USDT, DAI, WBTC).

**What you need:**
- Replace `chainId: 0` with the actual Abstract chain ID (must match the one above)
- Replace all `address: "0x000..."` with actual token contract addresses on Abstract
- Add/remove tokens based on what's available on Abstract
- Verify decimals for each token (usually 18 for most tokens, 6 for USDC/USDT, 8 for WBTC)

**Where to find token addresses:**
- Abstract's official documentation
- Abstract block explorer (e.g., Blockscout, Etherscan-based)
- Token list repositories (like Uniswap's token lists)
- Official bridge contracts

### 3. Root Configuration
**File:** `src/templates/root.yml` ✅ DONE

Already registered the `ethereum-abstract` namespace. No action needed.

### 4. Uniswap Configuration
**File:** `src/connectors/uniswap/uniswap.config.ts` ✅ DONE

Already added `'abstract'` to the supported networks list. No action needed.

### 5. Uniswap Contract Addresses
**File:** `src/connectors/uniswap/uniswap.contracts.ts`

This is the most important file to update! All addresses are currently placeholders.

**What you need:**

#### V2 Contracts (if available):
- `uniswapV2RouterAddress`: Uniswap V2 Router address
- `uniswapV2FactoryAddress`: Uniswap V2 Factory address
- **Set both to `null` if V2 is not deployed on Abstract**

#### V3 Contracts (most likely available):
- `uniswapV3SwapRouter02Address`: SwapRouter02 contract
- `uniswapV3NftManagerAddress`: NonfungiblePositionManager contract
- `uniswapV3QuoterV2ContractAddress`: QuoterV2 contract
- `uniswapV3FactoryAddress`: V3 Factory contract

#### Universal Router V2:
- `universalRouterV2Address`: Universal Router V2 contract

#### V4 Contracts (optional, newest version):
- `uniswapV4PoolManagerAddress`: V4 PoolManager (remove if not deployed)
- `uniswapV4StateViewAddress`: V4 StateView (remove if not deployed)

**Where to find Uniswap contract addresses:**
1. Official Uniswap docs: https://docs.uniswap.org/contracts/v3/reference/deployments/
2. Universal Router deployments: https://github.com/Uniswap/universal-router
3. Abstract's documentation if they have official Uniswap deployments
4. Use block explorer to verify contract addresses

**Important:** If you set an address to `null`, the system will throw an appropriate error when that version is requested.

### 6. Wrapped Token Address
**File:** `src/chains/ethereum/ethereum.ts`

```typescript
abstract: {
  address: '0x0000000000000000000000000000000000000000', // TODO: Replace
  symbol: 'WETH', // TODO: Update if different
  nativeSymbol: 'ETH', // TODO: Update if different
}
```

**What you need:**
- **address**: The wrapped native token contract address (usually WETH for L2s)
- **symbol**: Token symbol (WETH, WBNB, WAVAX, etc.)
- **nativeSymbol**: Native token symbol (ETH, BNB, AVAX, etc.)

## How to Get the Information

### 1. Official Abstract Documentation
Visit Abstract's official docs (e.g., https://docs.abstract.xyz or similar):
- Look for "Network Information" or "Chain Details"
- Check for RPC endpoints, Chain ID
- Look for deployed protocols section

### 2. Chainlist.org
Search for "Abstract" on https://chainlist.org to find:
- Chain ID
- RPC URLs
- Native currency information

### 3. Block Explorer
Find Abstract's block explorer (usually listed in their docs):
- Search for known token contracts (USDC, USDT, etc.)
- Verify Uniswap contract deployments
- Check token decimals

### 4. Abstract Bridge
If Abstract has a bridge from Ethereum/other chains:
- Check what tokens are supported
- Get bridged token addresses

### 5. Uniswap Interface
If Abstract is supported by Uniswap:
- Visit https://app.uniswap.org
- Connect to Abstract network
- Inspect network requests to find contract addresses

## Testing After Configuration

Once you've filled in all the placeholders:

```bash
# 1. Rebuild the project
pnpm build

# 2. Start in dev mode
pnpm start --passphrase=test123 --dev

# 3. Test chain status
curl http://localhost:15888/chains/ethereum/status?network=abstract

# Expected response:
# {
#   "chainId": <your-chain-id>,
#   "nodeURL": "<your-rpc-url>",
#   "currentBlockNumber": <current-block>
# }

# 4. Test Uniswap quote (if router is configured)
curl -X POST http://localhost:15888/connectors/uniswap/router/quote \
  -H "Content-Type: application/json" \
  -d '{
    "network": "abstract",
    "tokenIn": "<WETH-address>",
    "tokenOut": "<USDC-address>",
    "amountIn": "1000000000000000000"
  }'
```

## Common Patterns

### For L2s Similar to Optimism/Base/Arbitrum:
- Usually uses ETH as native token
- WETH is the wrapped version
- Common tokens: USDC, USDT, DAI, WBTC
- Often has Uniswap V3 deployed

### If Only V3 is Available (like Celo):
Set V2 addresses to `null`:
```typescript
uniswapV2RouterAddress: null,
uniswapV2FactoryAddress: null,
```

### If No Uniswap Deployment:
If Abstract doesn't have Uniswap, you'll need to:
1. Remove 'abstract' from `uniswap.config.ts`
2. Remove the abstract entry from `uniswap.contracts.ts`
3. Optionally add support for another DEX on Abstract

## Checklist

- [ ] Get Abstract chain ID and update `abstract.yml`
- [ ] Get Abstract RPC endpoint and update `abstract.yml`
- [ ] Confirm native token symbol (ETH, AETH, etc.)
- [ ] Get WETH/wrapped token address and update `ethereum.ts`
- [ ] Get common token addresses (USDC, USDT, etc.) and update `abstract.json`
- [ ] Find Uniswap V3 contract addresses and update `uniswap.contracts.ts`
- [ ] Find Universal Router address and update `uniswap.contracts.ts`
- [ ] Check if V2 is deployed (if not, set to null)
- [ ] Check if V4 is deployed (if not, remove those fields)
- [ ] Test with `pnpm build` and `pnpm start --dev`
- [ ] Test chain status endpoint
- [ ] Test token balance endpoint
- [ ] Test Uniswap quote endpoint

## File Locations Summary

```
src/templates/chains/ethereum/abstract.yml          ← Network config (4 fields)
src/templates/tokens/ethereum/abstract.json         ← Token list (5+ tokens)
src/templates/root.yml                              ← ✅ Already done
src/connectors/uniswap/uniswap.config.ts            ← ✅ Already done
src/connectors/uniswap/uniswap.contracts.ts         ← Uniswap addresses (9 fields)
src/chains/ethereum/ethereum.ts                     ← Wrapped token (3 fields)
```

## Questions?

If you're stuck, check these existing examples in the codebase:
- **Similar L2 (ETH-based)**: polygon.yml, base.yml, optimism.yml
- **V3 only network**: celo section in uniswap.contracts.ts
- **Token list format**: polygon.json, arbitrum.json

Good luck! 🚀
