import 'dotenv/config';
import { ethers } from 'ethers';

async function checkBalance() {
  const privateKey = process.env.PHAROS_PRIVATE_KEY;
  const rpcUrl = process.env.PHAROS_RPC_URL;

  console.log('\n💰 Wallet Balance Check');
  console.log('─'.repeat(60));

  if (!privateKey || !rpcUrl) {
    console.error('❌ Missing environment variables:');
    if (!privateKey) console.error('   - PHAROS_PRIVATE_KEY');
    if (!rpcUrl) console.error('   - PHAROS_RPC_URL');
    console.log('\n💡 Make sure your .env file is configured correctly\n');
    process.exit(1);
  }

  console.log('RPC URL:    ', rpcUrl);

  // Create provider with timeout and retry settings
  const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
    staticNetwork: true,
    batchMaxCount: 1,
  });

  const wallet = new ethers.Wallet(privateKey, provider);

  console.log('Address:    ', wallet.address);
  console.log('\n⏳ Fetching balance...\n');

  try {
    // Set a manual timeout
    const balancePromise = provider.getBalance(wallet.address);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout after 30s')), 30000)
    );

    const balance = await Promise.race([balancePromise, timeoutPromise]) as bigint;
    const balanceInPHRS = ethers.formatEther(balance);

    console.log('Balance:    ', balanceInPHRS, 'PHRS');
    console.log('─'.repeat(60));

    if (parseFloat(balanceInPHRS) < 0.1) {
      console.log('\n⚠️  Warning: Low balance! You may need more PHRS for transactions.');
      console.log('💡 Get testnet PHRS from the Pharos faucet\n');
    } else {
      console.log('\n✅ Sufficient balance for transactions\n');
    }

    // Also show block number to verify connection
    try {
      const blockNumber = await provider.getBlockNumber();
      console.log('Current block:', blockNumber);
      console.log('─'.repeat(60) + '\n');
    } catch (e) {
      // Ignore block number error
    }

  } catch (error: any) {
    console.log('─'.repeat(60));
    console.error('\n❌ Error:', error.message);
    
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Verify PHAROS_RPC_URL in .env:', rpcUrl);
    console.log('   2. Check if the Pharos node is running');
    console.log('   3. Try running: npm run test:rpc');
    console.log('   4. Check your internet connection\n');

    process.exit(1);
  }
}

checkBalance();