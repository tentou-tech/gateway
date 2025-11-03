import { ethers } from 'ethers';

const provider = new ethers.providers.JsonRpcProvider('https://api.mainnet.abs.xyz');

const UNIVERSAL_ROUTER = '0xE1b076ea612Db28a0d768660e4D81346c02ED75e';

async function checkRouter() {
  console.log('Checking Universal Router on Abstract (Chain 2741)');
  console.log('Router address:', UNIVERSAL_ROUTER);
  console.log('RPC:', 'https://api.mainnet.abs.xyz');
  console.log('');

  try {
    // Check if contract exists by getting code
    const code = await provider.getCode(UNIVERSAL_ROUTER);

    console.log('Contract code length:', code.length);

    if (code === '0x' || code.length <= 2) {
      console.log('❌ NO CONTRACT DEPLOYED at this address!');
      console.log('');
      console.log('The Universal Router V2 is NOT deployed at:', UNIVERSAL_ROUTER);
      console.log('You need to find the correct Universal Router address for Abstract.');
    } else {
      console.log('✅ Contract exists!');
      console.log('First 100 bytes of code:', code.substring(0, 100) + '...');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkRouter();
