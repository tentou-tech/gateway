import { computePoolAddress } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';

// Abstract network chainId
const chainId = 2741;

// Token addresses from your config
const GUILD_ADDRESS = '0xcEA652aCCfd9Dab53Fa1242294F4910708Cc0cc2';
const USDC_ADDRESS = '0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1';

// Current Factory address from config
const FACTORY_ADDRESS = '0xA1160e73B63F322ae88cC2d8E700833e71D0b2a1';

// Expected pool address
const EXPECTED_POOL = '0xd992548ee7f02147e4f1695AC72011f7421f7AD0';

// Create token objects
const GUILD = new Token(chainId, GUILD_ADDRESS, 18, 'GUILD', 'Guild');
const USDC = new Token(chainId, USDC_ADDRESS, 6, 'USDC.e', 'USDC.e');

// Test all fee tiers
const feeTiers = [100, 500, 3000, 10000]; // LOWEST, LOW, MEDIUM, HIGH

console.log('Testing pool address computation:');
console.log('Expected pool:', EXPECTED_POOL.toLowerCase());
console.log('Factory:', FACTORY_ADDRESS);
console.log('\nTrying all fee tiers:\n');

for (const fee of feeTiers) {
  try {
    const computed = computePoolAddress({
      factoryAddress: FACTORY_ADDRESS,
      tokenA: GUILD,
      tokenB: USDC,
      fee: fee
    });

    const match = computed.toLowerCase() === EXPECTED_POOL.toLowerCase();
    console.log(`Fee ${fee}: ${computed} ${match ? '✅ MATCH!' : ''}`);
  } catch (e) {
    console.log(`Fee ${fee}: Error - ${e.message}`);
  }
}
