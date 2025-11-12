#!/usr/bin/env node

/**
 * Script to check Permit2 expiration time for a specific address on Abstract chain
 *
 * Usage: node scripts/check-permit2-expiration.js
 */

const { ethers } = require('ethers');

// Configuration
const WALLET_ADDRESS = '0x087d4D82Cdb32089a97C2E74f840064b3Bc6f6a0';
const RPC_URL = 'https://api.mainnet.abs.xyz';
const CHAIN_ID = 2741;

// Permit2 address for Abstract
const PERMIT2_ADDRESS = '0x0000000000225e31D15943971F47aD3022F714Fa';

// Universal Router address for Abstract
const UNIVERSAL_ROUTER_ADDRESS = '0xE1b076ea612Db28a0d768660e4D81346c02ED75e';

// Token addresses on Abstract
const TOKENS = {
  'USDC.e': '0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1',
  'GUILD': '0xcEA652aCCfd9Dab53Fa1242294F4910708Cc0cc2',
};

// Permit2 allowance function ABI
const PERMIT2_ABI = [
  'function allowance(address owner, address token, address spender) external view returns (uint160 amount, uint48 expiration, uint48 nonce)',
];

async function checkPermit2Expiration() {
  console.log('\n🔍 Checking Permit2 Expiration on Abstract Chain');
  console.log('='.repeat(60));
  console.log(`Wallet Address: ${WALLET_ADDRESS}`);
  console.log(`Permit2 Address: ${PERMIT2_ADDRESS}`);
  console.log(`Universal Router: ${UNIVERSAL_ROUTER_ADDRESS}`);
  console.log(`RPC URL: ${RPC_URL}`);
  console.log('='.repeat(60));

  // Connect to Abstract network
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL, {
    chainId: CHAIN_ID,
    name: 'abstract',
  });

  // Create Permit2 contract instance
  const permit2Contract = new ethers.Contract(PERMIT2_ADDRESS, PERMIT2_ABI, provider);

  // Get current timestamp
  const currentTime = Math.floor(Date.now() / 1000);
  const currentDate = new Date(currentTime * 1000);

  console.log(`\n📅 Current Time: ${currentDate.toISOString()}`);
  console.log(`   Unix Timestamp: ${currentTime}\n`);

  // Check each token
  for (const [symbol, tokenAddress] of Object.entries(TOKENS)) {
    console.log(`\n📊 Checking ${symbol} (${tokenAddress})`);
    console.log('-'.repeat(60));

    try {
      // Query Permit2 allowance
      const [amount, expiration, nonce] = await permit2Contract.allowance(
        WALLET_ADDRESS,
        tokenAddress,
        UNIVERSAL_ROUTER_ADDRESS
      );

      console.log(`   Amount (uint160): ${amount.toString()}`);
      console.log(`   Nonce: ${nonce}`);
      console.log(`   Expiration (uint48): ${expiration}`);

      if (expiration == 0) {
        console.log(`   ⚠️  Status: No approval set (expiration = 0)`);
      } else {
        const expirationDate = new Date(expiration * 1000);
        const timeRemaining = expiration - currentTime;

        if (timeRemaining > 0) {
          const daysRemaining = timeRemaining / (24 * 60 * 60);
          const hoursRemaining = (timeRemaining % (24 * 60 * 60)) / (60 * 60);

          console.log(`   ✅ Status: Active`);
          console.log(`   📅 Expires at: ${expirationDate.toISOString()}`);
          console.log(`   ⏱️  Time remaining: ${daysRemaining.toFixed(2)} days (${Math.floor(daysRemaining)} days, ${Math.floor(hoursRemaining)} hours)`);

          // Check if approved with 2-year expiration
          const twoYearsInSeconds = 2 * 365 * 24 * 60 * 60;
          const timeSinceApproval = twoYearsInSeconds - timeRemaining;
          const daysSinceApproval = timeSinceApproval / (24 * 60 * 60);

          console.log(`   📆 Approved approximately: ${daysSinceApproval.toFixed(2)} days ago`);

          if (Math.abs(timeRemaining - twoYearsInSeconds) < (twoYearsInSeconds * 0.01)) {
            console.log(`   ✨ Recently approved with 2-year expiration`);
          }
        } else {
          const daysExpired = Math.abs(timeRemaining) / (24 * 60 * 60);
          console.log(`   ❌ Status: EXPIRED`);
          console.log(`   📅 Expired at: ${expirationDate.toISOString()}`);
          console.log(`   ⏱️  Expired ${daysExpired.toFixed(2)} days ago`);
          console.log(`   💡 Action needed: Re-approve token using spender: "uniswap/router"`);
        }
      }

      // Show human-readable amount
      if (!amount.eq(0)) {
        const maxUint160 = ethers.BigNumber.from('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');
        if (amount.eq(maxUint160)) {
          console.log(`   💰 Approved Amount: MAX (unlimited)`);
        } else {
          const decimals = symbol === 'USDC.e' ? 6 : 18;
          const formattedAmount = ethers.utils.formatUnits(amount, decimals);
          console.log(`   💰 Approved Amount: ${formattedAmount} ${symbol}`);
        }
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.message.includes('could not detect network')) {
        console.log(`   💡 Make sure the RPC URL is correct and accessible`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Check complete!\n');
}

// Run the script
checkPermit2Expiration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
