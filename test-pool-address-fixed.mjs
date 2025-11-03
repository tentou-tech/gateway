import { computePoolAddress } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';

// Abstract network chainId
const chainId = 2741;

// Token addresses - IN THE CORRECT ORDER FROM POOL
const USDC_ADDRESS = '0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1'; // Token0
const GUILD_ADDRESS = '0xcEA652aCCfd9Dab53Fa1242294F4910708Cc0cc2'; // Token1

// Factory address (confirmed correct)
const FACTORY_ADDRESS = '0xA1160e73B63F322ae88cC2d8E700833e71D0b2a1';

// Expected pool address
const EXPECTED_POOL = '0xd992548ee7f02147e4f1695AC72011f7421f7AD0';

// Create token objects
const USDC = new Token(chainId, USDC_ADDRESS, 6, 'USDC.e', 'USDC.e');
const GUILD = new Token(chainId, GUILD_ADDRESS, 18, 'GUILD', 'Guild');

// Fee tier from pool query
const fee = 3000;

console.log('Testing with correct token order:');
console.log('Token0 (USDC.e):', USDC_ADDRESS);
console.log('Token1 (GUILD):', GUILD_ADDRESS);
console.log('Factory:', FACTORY_ADDRESS);
console.log('Fee:', fee);
console.log('');

// computePoolAddress handles token ordering internally, so test both ways
console.log('Test 1: USDC, GUILD order');
const computed1 = computePoolAddress({
  factoryAddress: FACTORY_ADDRESS,
  tokenA: USDC,
  tokenB: GUILD,
  fee: fee
});
console.log('Computed:', computed1);
console.log('Expected:', EXPECTED_POOL);
console.log('Match:', computed1.toLowerCase() === EXPECTED_POOL.toLowerCase() ? '✅ SUCCESS!' : '❌');

console.log('');
console.log('Test 2: GUILD, USDC order');
const computed2 = computePoolAddress({
  factoryAddress: FACTORY_ADDRESS,
  tokenA: GUILD,
  tokenB: USDC,
  fee: fee
});
console.log('Computed:', computed2);
console.log('Expected:', EXPECTED_POOL);
console.log('Match:', computed2.toLowerCase() === EXPECTED_POOL.toLowerCase() ? '✅ SUCCESS!' : '❌');
