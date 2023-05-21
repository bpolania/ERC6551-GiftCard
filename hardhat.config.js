require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
require('dotenv').config();

const AURORA_PRIVATE_KEY = process.env.AURORA_PRIVATE_KEY;
module.exports = {
  solidity: "0.8.0",
  networks: {
    testnet_aurora: {
      url: 'https://testnet.aurora.dev',
      accounts: [`0x${AURORA_PRIVATE_KEY}`],
      chainId: 1313161555,
    },
    local_aurora: {
      url: 'http://localhost:8545',
      accounts: [`0x${AURORA_PRIVATE_KEY}`],
      chainId: 1313161555,
      gasPrice: 120 * 1000000000
    },
  }
};
