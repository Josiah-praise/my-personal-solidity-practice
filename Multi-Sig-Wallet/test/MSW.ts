import { MultiSigWallet } from "../typechain-types";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MultiSigWalletDeployment", async () => {
  it("should deploy successfully when passed the right parameters", async () => {
    const contractFactory = await ethers.getContractFactory("MultiSigWallet");
    const [deployer, john, james, nobody] = await ethers.getSigners();
    const confirmationThreshold = 2;

    const contractInstance = await contractFactory.deploy(
      [deployer.address, john.address, james.address],
      confirmationThreshold
    );

    await contractInstance.waitForDeployment();

    expect(await contractInstance.i_confirmationThreshold()).to.equal(
      confirmationThreshold
    );
    expect(await contractInstance.isOwner(deployer.address)).to.be.true;
    expect(await contractInstance.isOwner(james.address)).to.be.true;
    expect(await contractInstance.isOwner(john.address)).to.be.true;
    expect(await contractInstance.isOwner(nobody.address)).to.be.false;
  });

  it("should revert if owner array is empty", async () => {
    const contractFactory = await ethers.getContractFactory("MultiSigWallet");
    const confirmationThreshold = 2;

    await expect(
      contractFactory.deploy([], confirmationThreshold)
    ).to.revertedWith("Must pass at least one owner");
  });
    
    it("should revert if threshold is greater than number of owners", async () => {
        const contractFactory = await ethers.getContractFactory(
          "MultiSigWallet"
        );
        const [deployer, john, james, nobody] = await ethers.getSigners();
        const confirmationThreshold = 6;

       await expect(
         contractFactory.deploy(
           [deployer.address, john.address, james.address],
           confirmationThreshold
         )
       ).to.revertedWith("Threshold cannot be more than the number of owners");
    })
    
    it("should revert if threshold is 0", async () => {
        const contractFactory = await ethers.getContractFactory(
          "MultiSigWallet"
        );
        const [deployer, john, james, nobody] = await ethers.getSigners();
        const confirmationThreshold = 0;

        await expect(
          contractFactory.deploy(
            [deployer.address, john.address, james.address],
            confirmationThreshold
          )
        ).to.revertedWith("Threshold cannot be 0");
    })  
});

describe("MultiSigWallet", async () => {
  let instance: MultiSigWallet;
  let deployer, john, james, nobody;
  let confirmationThreshold = 2;

  beforeEach("SetUp", async () => {
    const contractFactory = await ethers.getContractFactory("MultiSigWallet");

    [deployer, john, james, nobody] = await ethers.getSigners();
    instance = await contractFactory.deploy(
      [deployer.address, john.address, james.address],
      confirmationThreshold
    );

    await instance.waitForDeployment();
  });

    describe("submitProposal", async () => {
        it("should successfully create a proposal", async () => {
            const value = 1e9 // 1Gwei
            const data = 
      })
  });
});
