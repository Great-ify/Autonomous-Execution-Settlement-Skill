import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { AESSEscrow } from "../typechain-types";

describe("AESSEscrow", function () {
  let escrow: AESSEscrow;
  let owner: SignerWithAddress;
  let worker: SignerWithAddress;
  let engine: SignerWithAddress;
  let stranger: SignerWithAddress;

  const agreementId = 1;
  const amount = ethers.parseEther("1");

  beforeEach(async function () {
    [owner, worker, engine, stranger] = await ethers.getSigners();
    const AESSEscrow = await ethers.getContractFactory("AESSEscrow");
    escrow = await AESSEscrow.deploy(engine.address);
  });

  describe("createEscrow", function () {
    it("should create escrow and emit Created + Funded events", async function () {
      await expect(
        escrow.connect(owner).createEscrow(agreementId, worker.address, { value: amount })
      )
        .to.emit(escrow, "EscrowCreated").withArgs(agreementId, amount)
        .and.to.emit(escrow, "EscrowFunded").withArgs(agreementId, amount);

      const esc = await escrow.escrows(agreementId);
      expect(esc.agreementId).to.equal(agreementId);
      expect(esc.payer).to.equal(owner.address);
      expect(esc.worker).to.equal(worker.address);
      expect(esc.amount).to.equal(amount);
      expect(esc.status).to.equal(1); // FUNDED
    });

    it("should hold the locked funds in the contract balance", async function () {
      await escrow.connect(owner).createEscrow(agreementId, worker.address, { value: amount });
      expect(await ethers.provider.getBalance(await escrow.getAddress())).to.equal(amount);
    });
  });

  describe("releaseFunds", function () {
    beforeEach(async function () {
      await escrow.connect(owner).createEscrow(agreementId, worker.address, { value: amount });
    });

    it("should release funds to the worker when called by the authorized engine", async function () {
      const workerBalanceBefore = await ethers.provider.getBalance(worker.address);

      await expect(escrow.connect(engine).releaseFunds(agreementId))
        .to.emit(escrow, "FundsReleased").withArgs(agreementId, amount);

      const workerBalanceAfter = await ethers.provider.getBalance(worker.address);
      expect(workerBalanceAfter - workerBalanceBefore).to.equal(amount);

      const esc = await escrow.escrows(agreementId);
      expect(esc.status).to.equal(2); // RELEASED
    });

    it("should reject release from a non-authorized caller", async function () {
      await expect(
        escrow.connect(stranger).releaseFunds(agreementId)
      ).to.be.revertedWith("Not authorized");
    });

    it("should reject release from the payer itself — only the settlement engine is authorized", async function () {
      await expect(
        escrow.connect(owner).releaseFunds(agreementId)
      ).to.be.revertedWith("Not authorized");
    });

    it("should reject a second release attempt on an already-released escrow", async function () {
      await escrow.connect(engine).releaseFunds(agreementId);

      await expect(
        escrow.connect(engine).releaseFunds(agreementId)
      ).to.be.revertedWith("Not fundable");
    });
  });

  describe("refundFunds", function () {
    beforeEach(async function () {
      await escrow.connect(owner).createEscrow(agreementId, worker.address, { value: amount });
    });

    it("should refund funds to the payer when called by the authorized engine", async function () {
      const payerBalanceBefore = await ethers.provider.getBalance(owner.address);

      await expect(escrow.connect(engine).refundFunds(agreementId))
        .to.emit(escrow, "FundsRefunded").withArgs(agreementId, amount);

      const payerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(payerBalanceAfter - payerBalanceBefore).to.equal(amount);

      const esc = await escrow.escrows(agreementId);
      expect(esc.status).to.equal(3); // REFUNDED
    });

    it("should reject refund from a non-authorized caller", async function () {
      await expect(
        escrow.connect(stranger).refundFunds(agreementId)
      ).to.be.revertedWith("Not authorized");
    });

    it("should not allow both release and refund on the same escrow", async function () {
      await escrow.connect(engine).releaseFunds(agreementId);

      await expect(
        escrow.connect(engine).refundFunds(agreementId)
      ).to.be.revertedWith("Not fundable");
    });
  });

  describe("freezeEscrow", function () {
    beforeEach(async function () {
      await escrow.connect(owner).createEscrow(agreementId, worker.address, { value: amount });
    });

    it("should freeze a funded escrow when called by the authorized engine", async function () {
      await expect(escrow.connect(engine).freezeEscrow(agreementId))
        .to.emit(escrow, "EscrowFrozen").withArgs(agreementId);

      const esc = await escrow.escrows(agreementId);
      expect(esc.status).to.equal(4); // FROZEN
    });

    it("should reject freeze from a non-authorized caller", async function () {
      await expect(
        escrow.connect(stranger).freezeEscrow(agreementId)
      ).to.be.revertedWith("Not authorized");
    });

    it("should keep funds locked in the contract after freezing — no payout occurs", async function () {
      const contractBalanceBefore = await ethers.provider.getBalance(await escrow.getAddress());
      await escrow.connect(engine).freezeEscrow(agreementId);
      const contractBalanceAfter = await ethers.provider.getBalance(await escrow.getAddress());
      expect(contractBalanceAfter).to.equal(contractBalanceBefore);
    });

    it("should reject release on a frozen escrow", async function () {
      await escrow.connect(engine).freezeEscrow(agreementId);

      await expect(
        escrow.connect(engine).releaseFunds(agreementId)
      ).to.be.revertedWith("Not fundable");
    });
  });

  describe("non-existent escrow", function () {
    it("should reject actions on an agreementId that was never created", async function () {
      const ghostId = 9999;
      await expect(
        escrow.connect(engine).releaseFunds(ghostId)
      ).to.be.revertedWith("Not fundable");
    });
  });
});
