const { expect } = require("chai");
const { ethers } = require("hardhat");
const simpleERC6551AccountContractABI = require('../contracts/abis/IERC655Account.json');
const giftCardAccountContractABI = require('../contracts/abis/GiftCardAccount.json');

describe("ERC6551Registry", function () {
  let ERC6551Registry, GiftCardAccount, owner, addr1, addr2;
  let giftCardAccount, erc6551Registry;
  let tokenId;
  let chainId, salt, deployedAccountTx, deployedAccountReceipt, deployedAccountAddress;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    GiftCard = await ethers.getContractFactory("GiftCard");
    giftCard = await GiftCard.deploy();
    await giftCard.deployed();
    await giftCard.mint(addr1.address,"https://chocolate-objective-giraffe-337.mypinata.cloud/ipfs/Qmefgi96NSNCJFrUHWuPH67Y6kuk8KMayb9vZGgzVYLNtg?_gl=1*1isypq3*rs_ga*MTc4MjMzNjM0NC4xNjg0NTc2MTI4*rs_ga_5RMPXG14TE*MTY4NDU3NjEyOC4xLjEuMTY4NDU3NjE3MS4xNy4wLjA.");
    tokenId = await giftCard.nextId();

    GiftCardAccount = await ethers.getContractFactory("GiftCardAccount");
    giftCardAccount = await GiftCardAccount.deploy();
    await giftCardAccount.deployed();

    ERC6551Registry = await ethers.getContractFactory("ERC6551Registry");
    erc6551Registry = await ERC6551Registry.deploy();
    await erc6551Registry.deployed();

    chainId = await owner.getChainId();
    salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));

    deployedAccountTx = await erc6551Registry.createAccount(giftCardAccount.address, chainId, giftCard.address, tokenId, salt, "0x");
    deployedAccountReceipt = await deployedAccountTx.wait();

    expect(deployedAccountReceipt.events[0].event).to.equal('AccountCreated');
    deployedAccountAddress = deployedAccountReceipt.events[0].args[0];
    expect(await ethers.provider.getCode(deployedAccountAddress)).not.to.equal('0x');
  });

  describe("Account", function () {
    it("Should create an account successfully and with the right address", async function () {
      const predictedAccountAddress = await erc6551Registry.account(giftCardAccount.address, chainId, giftCard.address, tokenId, salt);
      expect(deployedAccountAddress).to.be.equal(predictedAccountAddress);
    });

    it("Should have the right owner", async function () {
      const mockGiftCardAccount = await ethers.getContractAt(giftCardAccountContractABI, deployedAccountAddress);
      expect(await mockGiftCardAccount.owner()).to.equal(addr1.address);
    });
  });

  describe("Gift Card", function () {
    let initialBalance, finalBalance, mockGiftCardAccount;

    beforeEach(async function () {
      mockGiftCardAccount = await ethers.getContractAt(giftCardAccountContractABI, deployedAccountAddress);
      expect(await mockGiftCardAccount.owner()).to.equal(addr1.address);

      // Get initial balance of the contract
      initialBalance = await ethers.provider.getBalance(deployedAccountAddress);
      expect(initialBalance).to.equal(0);

      // Send 1 ether to the contract from the owner account
      [owner] = await ethers.getSigners();
      await owner.sendTransaction({
          to: deployedAccountAddress,
          value: ethers.utils.parseEther("1.0")  // Send 1 Ether
      });
      finalBalance = await ethers.provider.getBalance(deployedAccountAddress);
    })
    it("Should load balance", async function () {
      // Get final balance and check that the contract received the ether
      expect(finalBalance).to.equal(initialBalance.add(ethers.utils.parseEther("1.0")));
    });

    it("Should gift the giftcard", async function () {
      // approve transfer
      const tx = await giftCard.connect(addr1).setApprovalForAll(deployedAccountAddress, true);
      await tx.wait();

      await mockGiftCardAccount.connect(addr1).gift(addr2.address);
      expect(await mockGiftCardAccount.owner()).to.equal(addr2.address);
    });
  });
});