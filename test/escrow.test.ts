import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { AESSEscrow } from "../typechain-types";

describe("AESSEscrow", function () {
  let escrow: AESSEscrow;
  let owner: SignerWithAddress;
  let worker: SignerWithAddress;
  let engine: SignerWithAddress;

  beforeEach(async function () {
    [owner, worker, engine] = await ethers.getSigners();
    const AESSEscrow = await ethers.getContractFactory("AESSEscrow");
    escrow = await AESSEscrow.deploy(engine.address);
  });

  it("should create escrow", async function () {
    const agreementId = 1;
    const amount = ethers.parseEther("1");
    await escrow.connect(owner).createEscrow(agreementId, worker.address, { value: amount });
    
    const esc = await escrow.escrows(agreementId);
    expect(esc.agreementId).to.equal(agreementId);
    expect(esc.amount).to.equal(amount);
  });
});
