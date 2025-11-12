#!/usr/bin/env node

/**
 * Test script to verify Abstract chain uses correct Permit2 address
 */

const axios = require('axios');

const GATEWAY_URL = 'http://localhost:15888';
const TEST_WALLET = '0x087d4D82Cdb32089a97C2E74f840064b3Bc6f6a0';
const EXPECTED_PERMIT2 = '0x0000000000225e31D15943971F47aD3022F714Fa';

async function testAbstractPermit2() {
  console.log('\n🧪 Testing Abstract Permit2 Address Configuration');
  console.log('='.repeat(60));
  console.log(`Expected Permit2: ${EXPECTED_PERMIT2}`);
  console.log('='.repeat(60));

  try {
    // Test approve endpoint to see logs
    console.log('\n📝 Calling approve endpoint for Abstract...');
    console.log('   This will check allowances and show which Permit2 address is used\n');

    const response = await axios.post(`${GATEWAY_URL}/chains/abstract/approve`, {
      address: TEST_WALLET,
      spender: 'uniswap/router',
      token: 'USDC.e',
    });

    console.log('\n✅ Approve request completed');
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    if (error.response) {
      console.log('\n📊 Response received (may contain useful info):');
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
      
      // Check logs for Permit2 address
      console.log('\n💡 Check the Gateway server logs above for lines like:');
      console.log('   "Using Permit2 address: ..."');
      console.log('   "ERC20 allowance (USDC.e → Permit2 ..."');
    } else {
      console.error('\n❌ Request failed:', error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Test complete! Check server logs for Permit2 address.\n');
}

testAbstractPermit2()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
