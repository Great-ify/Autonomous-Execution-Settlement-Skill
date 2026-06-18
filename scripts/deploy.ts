import pkg from 'hardhat';
const { ethers, network } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Verifying network...");
  console.log(`Network: ${network.name}`);
  console.log(`Chain ID: ${network.config.chainId}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);

  if (balance < ethers.parseEther("0.1")) {
    throw new Error("Insufficient balance for deployment");
  }

  console.log("Deploying AESSEscrow...");
  const AESSEscrow = await ethers.getContractFactory("AESSEscrow");
  // Assuming the engine is the deployer for this test; replace with actual engine address in production
  const escrow = await AESSEscrow.deploy(deployer.address);
  await escrow.waitForDeployment();
  
  const address = await escrow.getAddress();
  const txHash = escrow.deploymentTransaction()?.hash;
  
  console.log(`AESSEscrow deployed to: ${address}`);
  console.log(`Deployment TX: ${txHash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
