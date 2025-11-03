import { ethers } from 'ethers';

// Abstract RPC
const provider = new ethers.providers.JsonRpcProvider('https://api.mainnet.abs.xyz');

// The actual pool address
const POOL_ADDRESS = '0xd992548ee7f02147e4f1695AC72011f7421f7AD0';

// Uniswap V3 Pool ABI (minimal - just what we need)
const POOL_ABI = [
  'function factory() external view returns (address)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
  'function fee() external view returns (uint24)',
  'function liquidity() external view returns (uint128)',
  'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)'
];

async function checkPool() {
  try {
    console.log('Checking pool:', POOL_ADDRESS);
    console.log('RPC:', 'https://api.mainnet.abs.xyz');
    console.log('');

    const poolContract = new ethers.Contract(POOL_ADDRESS, POOL_ABI, provider);

    const factory = await poolContract.factory();
    console.log('Factory address:', factory);

    const token0 = await poolContract.token0();
    console.log('Token0:', token0);

    const token1 = await poolContract.token1();
    console.log('Token1:', token1);

    const fee = await poolContract.fee();
    console.log('Fee tier:', fee);

    const liquidity = await poolContract.liquidity();
    console.log('Liquidity:', liquidity.toString());

    const slot0 = await poolContract.slot0();
    console.log('Current tick:', slot0.tick);
    console.log('SqrtPriceX96:', slot0.sqrtPriceX96.toString());

    // Now verify pool address computation with correct factory
    console.log('\n--- Verification ---');
    console.log('Expected Factory in config: 0xA1160e73B63F322ae88cC2d8E700833e71D0b2a1');
    console.log('Actual Factory from pool:', factory);
    console.log('Match:', factory.toLowerCase() === '0xA1160e73B63F322ae88cC2d8E700833e71D0b2a1'.toLowerCase() ? '✅' : '❌ MISMATCH!');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPool();
