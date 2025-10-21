import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("🚀 Deploying PolygonPay contracts to Polygon...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Contract addresses for Polygon PoS
  const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // Polygon Mainnet USDC
  const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // Polygon Mainnet USDT

  // For Mumbai testnet, use these instead:
  // const USDC_ADDRESS = "0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97";
  // const USDT_ADDRESS = "0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832";

  // 1. Deploy FeeManager
  console.log("\n📦 Deploying FeeManager...");
  const FeeManager = await ethers.getContractFactory("FeeManager");
  const feeManager = await upgrades.deployProxy(
    FeeManager,
    [deployer.address], // Treasury address
    { initializer: "initialize" }
  );
  await feeManager.waitForDeployment();
  const feeManagerAddress = await feeManager.getAddress();
  console.log("✅ FeeManager deployed to:", feeManagerAddress);

  // 2. Deploy MerchantRegistry
  console.log("\n📦 Deploying MerchantRegistry...");
  const MerchantRegistry = await ethers.getContractFactory("MerchantRegistry");
  const merchantRegistry = await upgrades.deployProxy(
    MerchantRegistry,
    [],
    { initializer: "initialize" }
  );
  await merchantRegistry.waitForDeployment();
  const merchantRegistryAddress = await merchantRegistry.getAddress();
  console.log("✅ MerchantRegistry deployed to:", merchantRegistryAddress);

  // 3. Deploy PaymentProcessor
  console.log("\n📦 Deploying PaymentProcessor...");
  const PaymentProcessor = await ethers.getContractFactory("PaymentProcessor");
  const paymentProcessor = await upgrades.deployProxy(
    PaymentProcessor,
    [feeManagerAddress, USDC_ADDRESS, USDT_ADDRESS],
    { initializer: "initialize" }
  );
  await paymentProcessor.waitForDeployment();
  const paymentProcessorAddress = await paymentProcessor.getAddress();
  console.log("✅ PaymentProcessor deployed to:", paymentProcessorAddress);

  // Summary
  console.log("\n🎉 Deployment Summary:");
  console.log("====================");
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("PaymentProcessor:", paymentProcessorAddress);
  console.log("MerchantRegistry:", merchantRegistryAddress);
  console.log("FeeManager:", feeManagerAddress);
  console.log("\n💾 Save these addresses to your .env file:");
  console.log(`NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS=${paymentProcessorAddress}`);
  console.log(`NEXT_PUBLIC_MERCHANT_REGISTRY_ADDRESS=${merchantRegistryAddress}`);
  console.log(`NEXT_PUBLIC_FEE_MANAGER_ADDRESS=${feeManagerAddress}`);

  // Verification instructions
  console.log("\n🔍 To verify contracts on Polygonscan:");
  console.log(`npx hardhat verify --network polygon ${paymentProcessorAddress}`);
  console.log(`npx hardhat verify --network polygon ${merchantRegistryAddress}`);
  console.log(`npx hardhat verify --network polygon ${feeManagerAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
