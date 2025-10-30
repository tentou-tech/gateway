# Abstract Chain - Quick TODO Reference

## Files to Edit (4 files with placeholders)

### 1️⃣ src/templates/chains/ethereum/abstract.yml
```yaml
chainID: 0  # ← REQUIRED: Get from Abstract docs or Chainlist.org
nodeURL: https://rpc.abstract.xyz  # ← REQUIRED: Official RPC endpoint
nativeCurrencySymbol: ETH  # ← Usually ETH for L2s
minGasPrice: 0.01  # ← Adjust based on network
```

### 2️⃣ src/templates/tokens/ethereum/abstract.json
For EACH token, update:
- `chainId: 0` → actual chain ID (must match above)
- `address: "0x000..."` → actual token contract address

Tokens included: WETH, USDC, USDT, DAI, WBTC (add/remove as needed)

### 3️⃣ src/connectors/uniswap/uniswap.contracts.ts
Around line 199, update the `abstract` entry:
- If V2 not deployed: set `uniswapV2RouterAddress` and `uniswapV2FactoryAddress` to `null`
- **Required V3 addresses** (4 addresses):
  - `uniswapV3SwapRouter02Address`
  - `uniswapV3NftManagerAddress`
  - `uniswapV3QuoterV2ContractAddress`
  - `uniswapV3FactoryAddress`
- `universalRouterV2Address` (if available)
- V4 addresses (optional, remove if not deployed)

### 4️⃣ src/chains/ethereum/ethereum.ts
Around line 694, update:
```typescript
abstract: {
  address: '0x000...',  // ← WETH contract address
  symbol: 'WETH',       // ← Usually WETH for L2s
  nativeSymbol: 'ETH',  // ← Native token symbol
}
```

## Where to Find Information

| What | Where |
|------|-------|
| Chain ID, RPC URL | https://chainlist.org (search "Abstract") |
| Token addresses | Abstract block explorer |
| Uniswap contracts | https://docs.uniswap.org/contracts/v3/reference/deployments/ |
| Wrapped token | Abstract docs or bridge contract |

## Test Commands

```bash
# After filling in placeholders:
pnpm build
pnpm start --passphrase=test123 --dev

# Test:
curl http://localhost:15888/chains/ethereum/status?network=abstract
```

## Files Already Done ✅

- src/templates/root.yml (namespace registered)
- src/connectors/uniswap/uniswap.config.ts ('abstract' added to networks)

---

**Total TODOs: ~20 placeholders across 4 files**

See ABSTRACT_CHAIN_SETUP.md for detailed instructions.
