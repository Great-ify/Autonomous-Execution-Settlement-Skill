import { ethers } from 'hardhat';

async function main() {
  console.log('🚀 Deploying AESSEscrow contract...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying from:', deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Balance:', ethers.formatEther(balance), 'PHRS\n');

  // Get settlement engine address (use deployer for now)
  const settlementEngine = deployer.address;

  const AESSEscrow = await ethers.getContractFactory('AESSEscrow');
  const escrow = await AESSEscrow.deploy(settlementEngine);

  await escrow.waitForDeployment();
  const address = await escrow.getAddress();

  console.log('✅ AESSEscrow deployed to:', address);
  console.log('\n📝 Add to .env:');
  console.log(`PHAROS_ESCROW_CONTRACT=${address}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });