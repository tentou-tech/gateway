import { ethers } from 'ethers';

// Get properly checksummed address
const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
const checksummed = ethers.utils.getAddress(address.toLowerCase());

console.log('Original:', address);
console.log('Checksummed:', checksummed);
