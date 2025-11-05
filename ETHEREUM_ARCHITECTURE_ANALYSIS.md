# Ethereum Chain Implementation - Complete Architecture Overview

## 1. DIRECTORY STRUCTURE

### Source Code Organization
```
/home/hogwarts-aura/gateway/src/chains/ethereum/
├── ethereum.ts                 # Main Ethereum class (singleton pattern)
├── ethereum.routes.ts          # Route registration plugin
├── ethereum.config.ts          # Configuration management
├── ethereum.utils.ts           # Utility functions
├── schemas.ts                  # TypeBox request/response schemas
├── infura-service.ts           # Infura RPC provider integration
├── ethereum-ledger.ts          # Hardware wallet support (Ledger)
└── routes/                     # Individual route handlers
    ├── status.ts              # Chain status endpoint
    ├── balances.ts            # Get token balances
    ├── allowances.ts          # Check token allowances
    ├── approve.ts             # Approve token spending (Permit2 support)
    ├── estimate-gas.ts        # Estimate gas prices
    ├── poll.ts                # Poll transaction status
    ├── wrap.ts                # Wrap native tokens (ETH → WETH, etc.)
    └── unwrap.ts              # Unwrap wrapped tokens
```

### Configuration Templates
```
/home/hogwarts-aura/gateway/src/templates/
├── chains/ethereum/
│   ├── mainnet.yml           # Ethereum Mainnet config
│   ├── arbitrum.yml          # Arbitrum config
│   ├── optimism.yml          # Optimism config
│   ├── base.yml              # Base config
│   ├── polygon.yml           # Polygon config
│   ├── bsc.yml               # Binance Smart Chain config
│   ├── avalanche.yml         # Avalanche config
│   ├── celo.yml              # Celo config
│   ├── sepolia.yml           # Sepolia testnet config
│   └── abstract.yml          # Abstract config (NEWLY ADDED)
│
├── tokens/ethereum/
│   ├── mainnet.json          # Mainnet token list
│   ├── arbitrum.json         # Arbitrum token list
│   ├── base.json             # Base token list
│   ├── polygon.json          # Polygon token list
│   ├── bsc.json              # BSC token list
│   ├── avalanche.json        # Avalanche token list
│   ├── celo.json             # Celo token list
│   ├── sepolia.json          # Sepolia token list
│   └── abstract.json         # Abstract token list (NEWLY ADDED)
│
└── namespace/
    └── ethereum-network-schema.json  # Network config validation schema
```

### Test Structure
```
/home/hogwarts-aura/gateway/test/chains/ethereum/
├── ethereum.test.js          # Main Ethereum class tests
├── wrap.test.js              # Wrap/unwrap functionality tests
├── wallet.test.js            # Wallet management tests
├── infura-service.test.ts    # Infura service tests
├── routes/
│   ├── status.test.ts        # Status endpoint tests
│   └── estimate-gas.test.ts  # Gas estimation tests
└── mocks/
    ├── status.json           # Status response mock data
    ├── balance.json          # Balance response mock data
    ├── approve.json          # Approve response mock data
    ├── allowances.json       # Allowances response mock data
    ├── wrap.json             # Wrap response mock data
    └── tokens.json           # Token list mock data
```

---

## 2. KEY FILES AND THEIR RESPONSIBILITIES

### 2.1 ethereum.ts - Core Chain Implementation
**Purpose**: Main Ethereum chain class using singleton pattern

**Key Components**:
- **Static Variables**:
  - `_instances`: Dictionary of chain instances (one per network)
  - `lastGasPriceEstimate`: Gas price cache (10-second TTL)
  - `WRAPPED_ADDRESSES`: Mapping of wrapped native tokens per network (WETH, WBNB, WAVAX, etc.)

- **Instance Properties**:
  - `provider`: ethers.js StaticJsonRpcProvider
  - `infuraService`: Optional Infura provider wrapper
  - `tokenList`: Array of TokenInfo objects
  - `tokenMap`: Record for O(1) token lookups
  - `network`: Current network name
  - `chainId`: Blockchain chain ID
  - `rpcUrl`: RPC endpoint URL
  - `nativeTokenSymbol`: Native token symbol (ETH, BNB, AVAX, etc.)
  - `minGasPrice`: Minimum gas price threshold (GWEI)

- **Critical Methods**:
  - `getInstance(network: string)`: Async singleton factory (initializes on first call)
  - `init()`: Initialize and load token list
  - `loadTokens()`: Load token list from TokenService
  - `getToken(symbol)`: Find token by symbol or address
  - `getBalances(address, tokens?)`: Get all token balances
  - `estimateGasPrice()`: Get current gas price with 10-second cache
  - `prepareGasOptions(gasPrice?, gasLimit?)`: Build EIP-1559 or legacy gas params
  - `approveERC20(contract, wallet, spender, amount)`: Approve token spending
  - `getERC20Balance(contract, wallet, decimals, timeout, symbol?)`: Get ERC20 balance with timeout
  - `getERC20Allowance(contract, wallet, spender, decimals)`: Check token allowance
  - `wrapNativeToken(wallet, amountInWei)`: Wrap native token to WETH/WBNB/etc.
  - `isWrappedNativeToken(tokenAddress)`: Check if token is wrapped version
  - `getWrappedNativeTokenAddress()`: Get wrapped token address for network
  - `getWallet(address)`: Load encrypted wallet from disk
  - `handleTransactionConfirmation()`: Process transaction receipt and return status

- **Infura Integration**:
  - Automatically switches to Infura provider if configured in chain config
  - Falls back to standard RPC if Infura unavailable
  - Supports both HTTP and WebSocket connections

- **Hardware Wallet Support**:
  - `isHardwareWallet(address)`: Check if address is hardware wallet
  - `getInfuraService()`: Access Infura service if available

- **Gas Price Optimization**:
  - EIP-1559 support (85% priority fee optimization on mainnet)
  - Legacy gas pricing fallback
  - Minimum gas price enforcement per network
  - 10-second cache to reduce RPC calls

---

### 2.2 ethereum.routes.ts - Route Registration Plugin
**Purpose**: Fastify plugin that registers all Ethereum routes

**Responsibility**: 
- Registers @fastify/sensible for error handling
- Imports and registers all 8 route handlers:
  - statusRoute
  - estimateGasRoute
  - balancesRoute
  - pollRoute
  - allowancesRoute
  - approveRoute
  - wrapRoute
  - unwrapRoute

**Pattern**: All routes are registered without prefix here (prefix is added at the app level in app.ts)

---

### 2.3 ethereum.config.ts - Configuration Management
**Purpose**: Centralized config access and type definitions

**Exports**:
- `EthereumNetworkConfig` interface:
  - `chainID`: Numeric chain identifier
  - `nodeURL`: RPC endpoint
  - `nativeCurrencySymbol`: e.g., ETH, BNB, AVAX
  - `minGasPrice`: Minimum gas price (optional)

- `EthereumChainConfig` interface:
  - `defaultNetwork`: Default network to use
  - `defaultWallet`: Default wallet address
  - `rpcProvider`: Provider type ('url' for standard, 'infura' for Infura)

- **Functions**:
  - `getEthereumNetworkConfig(network: string)`: Get network-specific config
  - `getEthereumChainConfig()`: Get chain-level config
  - `networks`: Array of available networks (loaded from templates)

**Config Loading**: Uses ConfigManagerV2 singleton to read from:
- `conf/chains/ethereum.yml` for chain config
- `conf/chains/ethereum/{network}.yml` for network-specific configs

---

### 2.4 ethereum.utils.ts - Utility Functions
**Purpose**: Helper functions for Ethereum operations

**Exports**:
- `DEFAULT_TRANSACTION_TIMEOUT`: 12 seconds
- `APPROVAL_TRANSACTION_TIMEOUT`: 60 seconds
- `isAddress(address: string)`: Regex validation for Ethereum address format
- `getAvailableEthereumNetworks()`: Read network list from template files
- `waitForTransactionWithTimeout(tx, timeout)`: Race transaction.wait() against timeout

---

### 2.5 schemas.ts - API Request/Response Schemas
**Purpose**: TypeBox schemas for all Ethereum routes

**Defined Schemas**:
1. Status:
   - `EthereumStatusRequest`: Optional network parameter
   - Returns: chain, network, rpcUrl, rpcProvider, currentBlockNumber, nativeCurrency

2. Balance:
   - `EthereumBalanceRequest`: network, address, optional tokens array
   - Returns: balances map (symbol → number)

3. Estimate Gas:
   - `EthereumEstimateGasRequest`: Optional network
   - Returns: gasPrice (GWEI)

4. Poll:
   - `EthereumPollRequest`: network, signature (txHash)
   - Returns: status code and transaction data

5. Allowances:
   - `AllowancesRequestSchema`: network, address, spender, tokens array
   - Response: spender, approvals record

6. Approve:
   - `ApproveRequestSchema`: network, address, spender, token, optional amount
   - Response: signature, status, optional data (fee, nonce, amount)

7. Wrap/Unwrap:
   - `WrapRequestSchema` / `UnwrapRequestSchema`: network, address, amount
   - Response: signature, status, optional data

---

### 2.6 infura-service.ts - RPC Provider Abstraction
**Purpose**: Encapsulate Infura provider logic

**Key Components**:
- `getInfuraNetworkName()`: Maps chainId to Infura network identifier
- `getInfuraHttpUrl()` / `getInfuraWebSocketUrl()`: Build Infura URLs with API key
- `getProvider()`: Returns WebSocket provider if available, else HTTP
- `healthCheck()`: Verify RPC connectivity
- `disconnect()`: Clean up WebSocket connections

**Network Mapping**: Supports 30+ Ethereum and EVM networks by chainId

---

### 2.7 infra-service.ts - Hardware Wallet Integration  
**Purpose**: Support for Ledger hardware wallets

**Functionality**:
- `signTransaction(address, unsignedTx)`: Sign transactions with Ledger
- Hardware wallet detection and validation
- Integration with ethers.js for transaction building

---

## 3. HOW ETHEREUM CHAIN IS REGISTERED AND INITIALIZED

### 3.1 Global Registration (app.ts)
```typescript
// Line 16: Import routes
import { ethereumRoutes } from './chains/ethereum/ethereum.routes';

// Line 219: Register routes with prefix
app.register(ethereumRoutes, { prefix: '/chains/ethereum' });
```

**Result**: All routes available at `/chains/ethereum/{operation}`
- `/chains/ethereum/status`
- `/chains/ethereum/balances`
- `/chains/ethereum/allowances`
- `/chains/ethereum/approve`
- `/chains/ethereum/estimate-gas`
- `/chains/ethereum/poll`
- `/chains/ethereum/wrap`
- `/chains/ethereum/unwrap`

### 3.2 Instance Initialization Flow
```
1. Route handler called (e.g., balancesRoute)
2. Request parsed using TypeBox schema
3. Ethereum.getInstance(network) called
   ├─ Check if instance exists in Ethereum._instances
   ├─ If not:
   │  ├─ Create new Ethereum(network)
   │  │  ├─ Load config via getEthereumNetworkConfig()
   │  │  ├─ Get rpcProvider from chain config
   │  │  ├─ If rpcProvider === 'infura':
   │  │  │  └─ Initialize InfuraService
   │  │  └─ Else: Initialize StaticJsonRpcProvider with nodeURL
   │  └─ Call await instance.init()
   │     └─ Load token list via TokenService.loadTokenList('ethereum', network)
   └─ Return cached instance
4. Use instance to perform operations
```

### 3.3 Configuration Loading Flow
```
/home/hogwarts-aura/gateway/conf/
├── chains/
│   ├── ethereum.yml              # Chain-level config
│   └── ethereum/
│       ├── mainnet.yml
│       ├── abstract.yml          # Loaded when network='abstract'
│       └── ... other networks
└── rpc/
    └── infura.yml                # API key and settings
```

---

## 4. NETWORK CONFIGURATION STRUCTURE

### 4.1 Network Config Template Format (YAML)
Example: `src/templates/chains/ethereum/mainnet.yml`
```yaml
chainID: 1                                           # Ethereum mainnet
nodeURL: https://ethereum-mev-protection...         # Standard RPC endpoint
nativeCurrencySymbol: ETH                           # Native token symbol
minGasPrice: 0.1                                    # Minimum gas price (GWEI)
```

### 4.2 Chain-Level Config
File: `src/templates/chains/ethereum.yml`
```yaml
defaultNetwork: mainnet                             # Default if not specified
defaultWallet: ''                                   # Default wallet address
rpcProvider: url                                    # 'url' or 'infura'
```

### 4.3 RPC Provider Config (Optional)
File: `src/templates/rpc/infura.yml` (if using Infura)
```yaml
apiKey: YOUR_INFURA_API_KEY
useWebSocket: false
```

---

## 5. HOW CONNECTORS LINK TO CHAINS

### 5.1 Connector Access to Chain Instance
Connectors (Uniswap, 0x, etc.) access the Ethereum chain like this:

```typescript
// In a connector route handler
const ethereum = await Ethereum.getInstance(network);

// Use chain methods
const balance = await ethereum.getERC20Balance(contract, wallet, decimals);
const allowance = await ethereum.getERC20Allowance(contract, wallet, spender, decimals);
const tx = await ethereum.approveERC20(contract, wallet, spender, amount);
const gasPrice = await ethereum.estimateGasPrice();
```

### 5.2 Connector Registration in app.ts
```typescript
// Line 236-240: Uniswap routes registered with multiple types
app.register(uniswapRoutes.router, {
  prefix: '/connectors/uniswap/router',
});
app.register(uniswapRoutes.amm, { prefix: '/connectors/uniswap/amm' });
app.register(uniswapRoutes.clmm, { prefix: '/connectors/uniswap/clmm' });

// Similarly for other connectors: 0x, Pancakeswap, etc.
```

### 5.3 Token and Allowance Integration
Connectors typically:
1. Get token info via `ethereum.getToken(symbol)`
2. Check allowances via chain methods
3. Request approvals through `/chains/ethereum/approve`
4. Build transactions that call connector contracts
5. Send transactions using chain's provider

---

## 6. ROUTE REGISTRATION PATTERNS

### 6.1 Individual Route Pattern
File: `src/chains/ethereum/routes/balances.ts`

```typescript
// Step 1: Define async function that performs the business logic
export async function getEthereumBalances(
  fastify: FastifyInstance,
  network: string,
  address: string,
  tokens?: string[],
): Promise<BalanceResponseType> {
  // Get chain instance
  const ethereum = await Ethereum.getInstance(network);
  // Perform operation
  const balances = await ethereum.getBalances(address, tokens);
  return { balances };
}

// Step 2: Define FastifyPluginAsync that registers the route
export const balancesRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{
    Body: BalanceRequestType;
    Reply: BalanceResponseType;
  }>(
    '/balances',
    {
      schema: {
        description: '...',
        tags: ['/chain/ethereum'],
        body: EthereumBalanceRequest,
        response: { 200: BalanceResponseSchema },
      },
    },
    async (request) => {
      const { network, address, tokens } = request.body;
      return await getEthereumBalances(fastify, network, address, tokens);
    },
  );
};
```

### 6.2 Route Grouping Pattern
File: `src/chains/ethereum/ethereum.routes.ts`

```typescript
export const ethereumRoutes: FastifyPluginAsync = async (fastify) => {
  // Register all routes
  fastify.register(statusRoute);
  fastify.register(balancesRoute);
  fastify.register(allowancesRoute);
  // ... more routes
};
```

### 6.3 Global Registration Pattern
File: `src/app.ts` (lines 217-219)

```typescript
app.register(ethereumRoutes, { prefix: '/chains/ethereum' });
```

**Result**: Routes available at:
- POST `/chains/ethereum/balances`
- GET `/chains/ethereum/status`
- POST `/chains/ethereum/approve`
- etc.

---

## 7. SPECIAL FEATURES AND PATTERNS

### 7.1 Permit2 Integration for Approvals
File: `src/chains/ethereum/routes/approve.ts`

**Pattern**:
- Universal Router V2 uses Permit2 for token approvals on most chains
- Abstract has a custom Permit2 deployment: `0x0000000000225e31D15943971F47aD3022F714Fa`
- Two-step approval flow:
  1. Approve token to Permit2
  2. Call Permit2.approve() to grant Universal Router permission
- Early exit if allowances already sufficient

**Custom Permit2 Address per Network**:
```typescript
const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3'; // Standard
const PERMIT2_ADDRESS_ABSTRACT = '0x0000000000225e31D15943971F47aD3022F714Fa'; // Abstract custom

function getPermit2Address(network: string): string {
  if (network.toLowerCase() === 'abstract') {
    return PERMIT2_ADDRESS_ABSTRACT;
  }
  return PERMIT2_ADDRESS;
}
```

### 7.2 Hardware Wallet Support (Ledger)
File: `src/chains/ethereum/routes/approve.ts`

**Pattern**:
- Check if address is hardware wallet: `await ethereum.isHardwareWallet(address)`
- If hardware:
  - Build unsigned transaction
  - Sign with Ledger: `ledger.signTransaction(address, unsignedTx)`
  - Send signed transaction via provider
- Otherwise: Load encrypted wallet from disk and sign directly

### 7.3 Wrapped Token Support
File: `src/chains/ethereum/ethereum.ts` (lines 652-706)

**Mapping**:
```typescript
WRAPPED_ADDRESSES = {
  mainnet: { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', nativeSymbol: 'ETH' },
  arbitrum: { address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', symbol: 'WETH', nativeSymbol: 'ETH' },
  // ... all supported networks
  abstract: { address: '0x3439153EB7AF838Ad19d56E1571FBD09333C2809', symbol: 'WETH', nativeSymbol: 'ETH' },
};
```

**Methods**:
- `getWrappedNativeTokenAddress()`: Get wrapped token for network
- `isWrappedNativeToken(tokenAddress)`: Check if token is wrapped version
- `wrapNativeToken(wallet, amountInWei)`: Call deposit() function
- Routes: `/chains/ethereum/wrap` and `/chains/ethereum/unwrap`

### 7.4 Gas Price Optimization
File: `src/chains/ethereum/ethereum.ts` (lines 110-154)

**Strategy**:
- 10-second cache to avoid excessive RPC calls
- Fallback to minGasPrice if estimate fails
- EIP-1559 support (85% priority fee on mainnet)
- Legacy gas pricing fallback

**Example**:
```typescript
// Cache hit within 10 seconds
const gasPrice = await ethereum.estimateGasPrice(); // Returns cached value
```

### 7.5 Balance Queries with Timeout
File: `src/chains/ethereum/ethereum.ts` (lines 505-529)

**Pattern**: Race balance requests against timeout to prevent hanging on problematic tokens
```typescript
const balancePromise = contract.balanceOf(wallet.address);
const timeoutPromise = new Promise<BigNumber>((_, reject) => {
  setTimeout(() => {
    reject(new Error('Token balance request timed out'));
  }, timeoutMs); // Default 5 seconds
});
const balance = await Promise.race([balancePromise, timeoutPromise]);
```

---

## 8. CONFIGURATION TEMPLATES AND SCHEMAS

### 8.1 Network Configuration Schema
File: `src/templates/namespace/ethereum-network-schema.json`

Validates:
- `chainID`: Required positive integer
- `nodeURL`: Required URL string
- `nativeCurrencySymbol`: Required string
- `minGasPrice`: Optional positive number

### 8.2 Chain Configuration Schema
File: `src/templates/namespace/ethereum-chain-schema.json`

Validates:
- `defaultNetwork`: Required, must be in available networks
- `defaultWallet`: Required string
- `rpcProvider`: Optional enum ('url', 'infura')

### 8.3 Root Configuration
File: `src/templates/root.yml` (lines 8-55)

Registers all configurations:
```yaml
$namespace ethereum:
  configurationPath: chains/ethereum.yml
  schemaPath: ethereum-chain-schema.json

$namespace ethereum-mainnet:
  configurationPath: chains/ethereum/mainnet.yml
  schemaPath: ethereum-network-schema.json

$namespace ethereum-abstract:
  configurationPath: chains/ethereum/abstract.yml
  schemaPath: ethereum-network-schema.json

# ... etc for all networks
```

---

## 9. TOKEN MANAGEMENT

### 9.1 Token List Loading
File: `src/chains/ethereum/ethereum.ts` (lines 295-317)

**Flow**:
1. Call `TokenService.getInstance().loadTokenList('ethereum', network)`
2. TokenService reads from `conf/tokens/ethereum/{network}.json`
3. Normalize addresses to checksummed format
4. Build tokenList and tokenMap (O(1) lookups by symbol)

### 9.2 Token List Format
File: `src/templates/tokens/ethereum/mainnet.json`

```json
[
  {
    "chainId": 1,
    "name": "USD Coin",
    "symbol": "USDC",
    "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "decimals": 6
  }
]
```

### 9.3 Token Lookup
File: `src/chains/ethereum/ethereum.ts` (lines 329-351)

**Methods**:
- `getToken(symbolOrAddress)`: Find by symbol or address
- `getTokensAsMap(tokens[])`: Get multiple tokens as map
- `getBalances(address, tokens?)`: Get balances (all or specific)

---

## 10. ERROR HANDLING AND RESPONSES

### 10.1 HTTP Error Handling
Uses Fastify's httpErrors:
```typescript
throw fastify.httpErrors.badRequest('Invalid input');
throw fastify.httpErrors.notFound('Token not found');
throw fastify.httpErrors.internalServerError('RPC error');
```

### 10.2 Transaction Status Codes
File: `src/chains/ethereum/ethereum.ts` (lines 780-879)

```typescript
status = -1   // FAILED: Transaction reverted on-chain
status = 0    // PENDING: Receipt not yet available
status = 1    // CONFIRMED: Transaction successful
```

### 10.3 Specific Error Cases in Approve Route
```typescript
if (error.message.includes('insufficient funds'))
  → Lack of ETH for gas
if (error.message.includes('rejected on Ledger'))
  → User rejected on hardware device
if (error.message.includes('Ledger device is locked'))
  → Hardware wallet locked
```

---

## 11. TESTING STRUCTURE

### 11.1 Test Organization
- Mirrors src directory structure
- Mock data in `test/chains/ethereum/mocks/`
- Uses Jest with `--runInBand` flag for serial execution

### 11.2 Running Tests
```bash
# All tests
pnpm test

# With coverage
pnpm test:cov

# Specific test file (dev mode)
GATEWAY_TEST_MODE=dev jest --runInBand test/chains/ethereum/ethereum.test.js
```

---

## 12. KEY PATTERNS FOR DUPLICATION (Abstract Chain)

When creating a new chain implementation, follow these patterns:

### Pattern 1: Configuration Files
Create:
- `src/templates/chains/ethereum/abstract.yml` ✓ (Already exists)
- `src/templates/tokens/ethereum/abstract.json` ✓ (Already exists)
- Register in `src/templates/root.yml` ✓ (Already done)

### Pattern 2: Chain Class (Singleton)
- Implement getInstance(network) that caches instances
- Initialize RPC provider (standard or optimized)
- Load token list on init()
- Implement all core methods: balances, approvals, transactions

### Pattern 3: Route Handlers
- One async function for business logic
- One FastifyPluginAsync for route registration
- Use TypeBox schemas for validation
- Call chain.getInstance(network) to get chain instance

### Pattern 4: Global Registration
- Import chain routes in app.ts
- Register with prefix: `app.register(chainRoutes, { prefix: '/chains/{name}' })`

### Pattern 5: Supported Operations
Standard set for EVM chains:
- Status: Get chain info and RPC connectivity
- Balances: Get token balances
- Allowances: Check token allowances
- Approve: Set token allowances
- EstimateGas: Get current gas prices
- Poll: Check transaction status
- Wrap: Native → wrapped token
- Unwrap: Wrapped → native token

---

## 13. SPECIAL CONSIDERATIONS FOR ABSTRACT

### Current Abstract Status
- Configuration template exists: `abstract.yml`
- Token list exists: `abstract.json` (with 3 sample tokens)
- Registered in root.yml
- Supports approve operation with custom Permit2 address
- WETH address configured (chainID: 2741)

### TODOs in Current Abstract Setup
1. abstract.yml needs:
   - Correct chainID (2741 is placeholder)
   - Official Abstract RPC endpoint
   - Accurate minGasPrice

2. abstract.json needs:
   - Correct token addresses and decimals
   - More comprehensive token list

3. ethereum-ledger.ts needs:
   - Abstract chainID in any chain-specific ledger logic

4. Any approvals or Permit2 logic:
   - Custom Permit2 address already handled in approve.ts
   - Abstract detected by network name

---

## SUMMARY

The Ethereum chain implementation follows a clean, modular architecture:

1. **Core class** (ethereum.ts) manages chain state, token loading, and RPC connectivity
2. **Routes** are organized in dedicated files and grouped for registration
3. **Configuration** is externalized to YAML templates with schema validation
4. **Connectors** access chains through a standardized getInstance() pattern
5. **Special features** (Permit2, hardware wallets, gas optimization) are embedded in appropriate layers
6. **Singleton pattern** ensures only one instance per network

To duplicate this for Abstract or any new chain, follow the established patterns for:
- Configuration files
- Chain class implementation
- Route definition and registration
- Token list management

