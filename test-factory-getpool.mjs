import { ethers } from 'ethers';

const provider = new ethers.providers.JsonRpcProvider('https://api.mainnet.abs.xyz');

const FACTORY_ADDRESS = '0xA1160e73B63F322ae88cC2d8E700833e71D0b2a1';
const USDC_ADDRESS = '0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1';
const GUILD_ADDRESS = '0xcEA652aCCfd9Dab53Fa1242294F4910708Cc0cc2';

const FACTORY_ABI = [
  'function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)'
];

async function testGetPool() {
  const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);

  console.log('Querying factory.getPool()');
  console.log('Factory:', FACTORY_ADDRESS);
  console.log('Token0 (USDC.e):', USDC_ADDRESS);
  console.log('Token1 (GUILD):', GUILD_ADDRESS);
  console.log('Fee: 3000');
  console.log('');

  try {
    const pool = await factory.getPool(USDC_ADDRESS, GUILD_ADDRESS, 3000);
    console.log('Pool address from factory:', pool);
    console.log('Expected pool:', '0xd992548ee7f02147e4f1695AC72011f7421f7AD0');
    console.log('Match:', pool.toLowerCase() === '0xd992548ee7f02147e4f1695AC72011f7421f7AD0'.toLowerCase() ? '✅' : '❌');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testGetPool();
