const { expect } = require("chai");
const { ethers } = require("hardhat");
const giftCardAccountContractABI = require('../contracts/abis/GiftCardAccount.json');

describe("GiftCard", function () {
  let owner, addr1, addr2, GiftCard, giftCard, giftCardAccount;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    GiftCard = await ethers.getContractFactory("GiftCardExtended");
    giftCard = await GiftCard.deploy();
    await giftCard.deployed();
  });

  describe("Minting", function () {

    it("Should mint a gift card", async function () {
      const initialBalance = await owner.getBalance();
      const tokenURI = "https://chocolate-objective-giraffe-337.mypinata.cloud/ipfs/Qmefgi96NSNCJFrUHWuPH67Y6kuk8KMayb9vZGgzVYLNtg?_gl=1*1isypq3*rs_ga*MTc4MjMzNjM0NC4xNjg0NTc2MTI4*rs_ga_5RMPXG14TE*MTY4NDU3NjEyOC4xLjEuMTY4NDU3NjE3MS4xNy4wLjA.";
      let amount = ethers.utils.parseEther("1.0");
      
      // Mint a new gift card
      await giftCard.mint(addr1.address, tokenURI, {value: amount});

      // Check that the Ether was transferred
      const finalBalance = await owner.getBalance();
      expect(finalBalance).to.be.below(initialBalance);
      const newOwnerBalance = await giftCard.balanceOf(addr1.address);
      expect(newOwnerBalance).to.be.equal(1);
    });
  });

  describe("Gifting", function () {
    it("Should gift a card", async function () {
      const tokenURI = "https://chocolate-objective-giraffe-337.mypinata.cloud/ipfs/Qmefgi96NSNCJFrUHWuPH67Y6kuk8KMayb9vZGgzVYLNtg?_gl=1*1isypq3*rs_ga*MTc4MjMzNjM0NC4xNjg0NTc2MTI4*rs_ga_5RMPXG14TE*MTY4NDU3NjEyOC4xLjEuMTY4NDU3NjE3MS4xNy4wLjA.";
      let amount = ethers.utils.parseEther("1.0");
      // Mint a new gift card
      const mintTx = await giftCard.mint(addr1.address, tokenURI, {value: amount});
      const receipt = await mintTx.wait();
      const tokenId = receipt.events[1].args.tokenId;
      const tx = await giftCard.connect(addr1).setApprovalForAll(await giftCard.address, true);
      await tx.wait();
      // Gift the card
      await giftCard.connect(addr1).gift(addr2.address, tokenId);
      expect(await giftCard.ownerOf(tokenId)).to.be.equal(addr2.address);
    });
  });

  describe("Payment", function () {
    it("Should pay", async function () {
      const tokenURI = "https://chocolate-objective-giraffe-337.mypinata.cloud/ipfs/Qmefgi96NSNCJFrUHWuPH67Y6kuk8KMayb9vZGgzVYLNtg?_gl=1*1isypq3*rs_ga*MTc4MjMzNjM0NC4xNjg0NTc2MTI4*rs_ga_5RMPXG14TE*MTY4NDU3NjEyOC4xLjEuMTY4NDU3NjE3MS4xNy4wLjA.";
      let amount = ethers.utils.parseEther("1.0");
      // Mint a new gift card
      const mintTx = await giftCard.mint(addr1.address, tokenURI, {value: amount});
      const receipt = await mintTx.wait();
      const tokenId = receipt.events[1].args.tokenId;
      const tx = await giftCard.connect(addr1).setApprovalForAll(await giftCard.address, true);
      await tx.wait();
      // Gift the card
      const beforeBalance = await addr2.getBalance();
      const bigNumber = ethers.BigNumber.from("10000000000000000000000");
      expect(beforeBalance).to.be.equal(bigNumber);
      const mockGiftCardAccount = await ethers.getContractAt(giftCardAccountContractABI, await giftCard.accountAddress());
      await mockGiftCardAccount.connect(addr1).executeCall(addr2.address, ethers.BigNumber.from("10000000000"), "0x");
      const afterBalance = await addr2.getBalance();
      expect(beforeBalance).to.be.lessThan(afterBalance);
    });
  });
});

