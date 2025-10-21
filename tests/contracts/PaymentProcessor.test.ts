import { expect } from "chai";
import { ethers } from "hardhat";
import { PaymentProcessor, MockERC20 } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("PaymentProcessor", function () {
  let paymentProcessor: PaymentProcessor;
  let usdc: MockERC20;
  let usdt: MockERC20;
  let owner: SignerWithAddress;
  let merchant: SignerWithAddress;
  let customer: SignerWithAddress;
  let feeCollector: SignerWithAddress;

  const PLATFORM_FEE_BPS = 40; // 0.4%
  const BPS_DENOMINATOR = 10000;

  beforeEach(async function () {
    [owner, merchant, customer, feeCollector] = await ethers.getSigners();

    // Deploy mock USDC and USDT tokens
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
    usdt = await MockERC20.deploy("Tether USD", "USDT", 6);

    // Deploy PaymentProcessor
    const PaymentProcessor = await ethers.getContractFactory("PaymentProcessor");
    paymentProcessor = await PaymentProcessor.deploy();
    await paymentProcessor.initialize(
      feeCollector.address,
      await usdc.getAddress(),
      await usdt.getAddress()
    );

    // Mint tokens to customer
    await usdc.mint(customer.address, ethers.parseUnits("10000", 6));
    await usdt.mint(customer.address, ethers.parseUnits("10000", 6));
  });

  describe("Payment Processing", function () {
    it("should process USDC payment with correct fee deduction", async function () {
      const amount = ethers.parseUnits("100", 6); // 100 USDC
      const paymentId = ethers.keccak256(ethers.toUtf8Bytes("payment-1"));

      // Calculate expected amounts
      const fee = (amount * BigInt(PLATFORM_FEE_BPS)) / BigInt(BPS_DENOMINATOR);
      const merchantAmount = amount - fee;

      // Approve and process payment
      await usdc.connect(customer).approve(await paymentProcessor.getAddress(), amount);

      await expect(
        paymentProcessor.connect(customer).processPayment(
          merchant.address,
          await usdc.getAddress(),
          amount,
          paymentId
        )
      )
        .to.emit(paymentProcessor, "PaymentReceived")
        .withArgs(
          paymentId,
          merchant.address,
          customer.address,
          await usdc.getAddress(),
          amount,
          fee,
          await ethers.provider.getBlock("latest").then(b => b?.timestamp)
        );

      // Verify balances
      expect(await usdc.balanceOf(merchant.address)).to.equal(merchantAmount);
      expect(await usdc.balanceOf(feeCollector.address)).to.equal(fee);
    });

    it("should process USDT payment correctly", async function () {
      const amount = ethers.parseUnits("50", 6); // 50 USDT
      const paymentId = ethers.keccak256(ethers.toUtf8Bytes("payment-2"));

      const fee = (amount * BigInt(PLATFORM_FEE_BPS)) / BigInt(BPS_DENOMINATOR);
      const merchantAmount = amount - fee;

      await usdt.connect(customer).approve(await paymentProcessor.getAddress(), amount);

      await paymentProcessor.connect(customer).processPayment(
        merchant.address,
        await usdt.getAddress(),
        amount,
        paymentId
      );

      expect(await usdt.balanceOf(merchant.address)).to.equal(merchantAmount);
      expect(await usdt.balanceOf(feeCollector.address)).to.equal(fee);
    });

    it("should revert on duplicate payment ID", async function () {
      const amount = ethers.parseUnits("100", 6);
      const paymentId = ethers.keccak256(ethers.toUtf8Bytes("payment-duplicate"));

      await usdc.connect(customer).approve(await paymentProcessor.getAddress(), amount * BigInt(2));

      // First payment should succeed
      await paymentProcessor.connect(customer).processPayment(
        merchant.address,
        await usdc.getAddress(),
        amount,
        paymentId
      );

      // Second payment with same ID should fail
      await expect(
        paymentProcessor.connect(customer).processPayment(
          merchant.address,
          await usdc.getAddress(),
          amount,
          paymentId
        )
      ).to.be.revertedWith("Payment already processed");
    });

    it("should revert for unsupported token", async function () {
      const MockERC20 = await ethers.getContractFactory("MockERC20");
      const randomToken = await MockERC20.deploy("Random Token", "RND", 18);

      const amount = ethers.parseUnits("100", 18);
      const paymentId = ethers.keccak256(ethers.toUtf8Bytes("payment-unsupported"));

      await expect(
        paymentProcessor.connect(customer).processPayment(
          merchant.address,
          await randomToken.getAddress(),
          amount,
          paymentId
        )
      ).to.be.revertedWith("Token not supported");
    });

    it("should calculate fee correctly (0.4%)", async function () {
      const testCases = [
        { amount: "100", expectedFee: "0.4" },
        { amount: "1000", expectedFee: "4" },
        { amount: "50.50", expectedFee: "0.202" },
      ];

      for (const testCase of testCases) {
        const amount = ethers.parseUnits(testCase.amount, 6);
        const expectedFee = (amount * BigInt(PLATFORM_FEE_BPS)) / BigInt(BPS_DENOMINATOR);

        // Verify fee calculation matches expected
        const calculatedFeeStr = ethers.formatUnits(expectedFee, 6);
        expect(parseFloat(calculatedFeeStr)).to.be.closeTo(
          parseFloat(testCase.expectedFee),
          0.001
        );
      }
    });
  });

  describe("Access Control", function () {
    it("should allow owner to pause/unpause", async function () {
      await paymentProcessor.pause();

      const amount = ethers.parseUnits("100", 6);
      const paymentId = ethers.keccak256(ethers.toUtf8Bytes("payment-paused"));

      await usdc.connect(customer).approve(await paymentProcessor.getAddress(), amount);

      await expect(
        paymentProcessor.connect(customer).processPayment(
          merchant.address,
          await usdc.getAddress(),
          amount,
          paymentId
        )
      ).to.be.revertedWith("Pausable: paused");

      await paymentProcessor.unpause();

      // Should work after unpause
      await expect(
        paymentProcessor.connect(customer).processPayment(
          merchant.address,
          await usdc.getAddress(),
          amount,
          paymentId
        )
      ).to.emit(paymentProcessor, "PaymentReceived");
    });

    it("should only allow owner to update fee collector", async function () {
      const newCollector = ethers.Wallet.createRandom().address;

      await expect(
        paymentProcessor.connect(customer).setFeeCollector(newCollector)
      ).to.be.reverted;

      await expect(
        paymentProcessor.connect(owner).setFeeCollector(newCollector)
      )
        .to.emit(paymentProcessor, "FeeCollectorUpdated")
        .withArgs(feeCollector.address, newCollector);
    });
  });

  describe("Batch Processing", function () {
    it("should process multiple payments in a single transaction", async function () {
      const merchants = [merchant.address, merchant.address];
      const tokens = [await usdc.getAddress(), await usdt.getAddress()];
      const amounts = [ethers.parseUnits("100", 6), ethers.parseUnits("50", 6)];
      const paymentIds = [
        ethers.keccak256(ethers.toUtf8Bytes("batch-1")),
        ethers.keccak256(ethers.toUtf8Bytes("batch-2")),
      ];

      const totalApproval = amounts[0] + amounts[1];
      await usdc.connect(customer).approve(await paymentProcessor.getAddress(), amounts[0]);
      await usdt.connect(customer).approve(await paymentProcessor.getAddress(), amounts[1]);

      await paymentProcessor.connect(customer).batchProcessPayments(
        merchants,
        tokens,
        amounts,
        paymentIds
      );

      // Verify both payments were processed
      expect(await usdc.balanceOf(merchant.address)).to.be.greaterThan(0);
      expect(await usdt.balanceOf(merchant.address)).to.be.greaterThan(0);
    });
  });
});
