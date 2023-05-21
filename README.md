# ERC6551 GiftCard
ERC6551 GiftCard contracts that allows users to mint, load balance and reemed git cards.

## Features

* Mint gift cards with a URL and a value
* Redeem gift cards for goods or services

## About 6551

For more information about ERC-6551 Non-fungible Token Bound Accounts you can read EIP [here](https://eips.ethereum.org/EIPS/eip-6551).

ERC-6551 is a proposed standard to enhance the functionality of ERC-721 tokens, also known as Non-Fungible Tokens (NFTs), by providing each NFT with its unique smart contract account. 

In the context of real-world applications, this is like giving your character in a video game its wallet where it can own and manage assets or, as we propose in this project, a NFT gift card that holds its own balance and can be redeemed. Currently, ERC-721 tokens are unable to do this. ERC-6551 aims to solve this problem by creating unique smart contract accounts, referred to as "token bound accounts," for each ERC-721 token. 

Here's how it works in simpler terms:

1. **Registry:** It serves as a one-stop-shop for creating new token bound accounts for any ERC-721 token. You can think of this registry as a factory that produces new wallets for each NFT.

2. **Token Bound Accounts:** These are like individual wallets for each NFT. They are owned by a single NFT, allowing the NFT to interact with the Ethereum blockchain, record transaction history, and own other on-chain assets like Ether or other tokens. 

3. **Control:** The ownership of the token bound account is tied to the ownership of the ERC-721 token. This means if you own the NFT, you also control its associated token bound account.

4. **Compatibility:** The proposal is designed to be backward compatible with existing ERC-721 tokens and infrastructure. This means that existing NFTs can be updated to have token bound accounts without requiring changes to their current setup.

There are, of course, security considerations, especially regarding fraud prevention and handling of ownership cycles. Read the aforementioned article if you want to read about strategies to prevent scams during token sales and cautions about scenarios where an ERC-721 token ends up being owned by its own token bound account, which could lock up the assets indefinitely. 

In general, ERC-6551 aims to expand the capabilities of NFTs, enabling a wide range of new use cases for NFTs and their interaction with other assets and applications on the blockchain.

## About the GiftCards

In this repo you will find two approaches.

* **GiftCard.sol** Here, you need to create instances of the registry, the account, and the ERC-721 and follow the process of linking them all together. As you can see in the test cases, it is necessary to instantiate the ERC-721 (`GiftCard.sol`), the ERC6551 Account (`GiftCardAccount.sol`), and the registry (`ERC6551Registry.sol`). Then you just need to generate an implementation with the registry's `createAccount` function. Afterward, you can load and redeem the balance to the gift card.

```solidity
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
```

* **GiftCardExtended.sol** In this approach, it's only necessary to create an NFT contract and call the `mint` function sending in the `value` of the amount you want to load in the gift card. After that, it will be possible to redeem it. Simple to implement but less flexible.

```solidity
    GiftCard = await ethers.getContractFactory("GiftCardExtended");
    giftCard = await GiftCard.deploy();
    await giftCard.deployed();
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
```

## Run the code

* The code is configured to be deployed in Aurora Testnet. You can find a faucet [here](https://aurora.dev/faucet)

* You need to setup a `.env` file with the `AURORA_PRIVATE_KEY` variable and assign it your private key. You can use the `sample.env`, just rename it to `.env` and change the values.

### Install

```shell
npm install
```

### Test

```shell
npx hardhat test
```

### Deploy

#### Deploy Contracts for the GitfCard Approach
```shell
npx hardhat run --network testnet deployGifCard.js
```
#### Deploy Contracts for the GitfCardExtended Approach
```shell
npx hardhat run --network testnet deployGifCardExtended.js
```

## Todos

* Create `GiftCardLibrary.sol` and move some functions such as `generateRandomSalt` and `nonce`
* Create interfaces for the gift card contracts

## Disclaimer

This code is for educational purposes, requires upgrades and improvements and, of course, it is not audited. So, use it wisely!

Enjoy!


