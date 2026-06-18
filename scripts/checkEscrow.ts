import 'dotenv/config';
import { ethers } from 'ethers';

async function checkEscrow() {
  const contractAddress = process.env.PHAROS_ESCROW_CONTRACT;
  const rpcUrl = process.env.PHAROS_RPC_URL;

  if (!contractAddress || !rpcUrl) {
    console.error('\n❌ Missing environment variables:');
    if (!contractAddress) console.error('   - PHAROS_ESCROW_CONTRACT');
    if (!rpcUrl) console.error('   - PHAROS_RPC_URL');
    console.log('\n💡 Make sure your .env file is configured\n');
    process.exit(1);
  }

  const agreementId = process.argv[2];

  if (!agreementId) {
    console.log('\n📋 Usage: npm run check:escrow <agreementId>');
    console.log('Example: npm run check:escrow 11585642026240940126139863671563577256677097941131725267998065148055902316487');
    console.log('\n💡 Get agreement ID from previous demo runs\n');
    process.exit(0);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
    staticNetwork: true,
  });

  const abi = [
    'function escrows(uint256) view returns (uint256 agreementId, address payer, address worker, uint256 amount, uint8 status)',
  ];

  const contract = new ethers.Contract(contractAddress, abi, provider);

  try {
    console.log(`\n🔍 Checking escrow...`);
    console.log('─'.repeat(60));
    console.log('Contract:      ', contractAddress);
    console.log('Agreement ID:  ', agreementId);
    console.log('\n⏳ Fetching data...\n');

    const escrow = await contract.escrows(BigInt(agreementId));

    const statuses = ['CREATED', 'FUNDED', 'RELEASED', 'REFUNDED', 'FROZEN'];

    console.log('📋 Escrow Details:');
    console.log('─'.repeat(60));
    console.log('Agreement ID:', escrow.agreementId.toString());
    console.log('Payer:       ', escrow.payer);
    console.log('Worker:      ', escrow.worker);
    console.log('Amount:      ', ethers.formatEther(escrow.amount), 'PHRS');
    console.log('Status:      ', statuses[Number(escrow.status)] || 'UNKNOWN');
    console.log('─'.repeat(60) + '\n');

    if (escrow.amount === 0n) {
      console.log('⚠️  Warning: This escrow has not been funded or does not exist.\n');
    }
  } catch (error: any) {
    console.log('─'.repeat(60));
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Verify the agreement ID is correct');
    console.log('   2. Check PHAROS_RPC_URL:', rpcUrl);
    console.log('   3. Check PHAROS_ESCROW_CONTRACT:', contractAddress);
    console.log('   4. Run: npm run test:rpc\n');
  }
}

checkEscrow();