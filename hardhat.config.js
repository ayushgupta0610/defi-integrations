require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("@nomiclabs/hardhat-ethers");

require('dotenv').config();

const walletUtils = require('./walletUtils');

const config = {
  defaultNetwork: 'hardhat',
  networks: {
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      // @ts-ignore
      accounts: process.env.PRIVATE_KEY1 !== undefined ? [process.env.PRIVATE_KEY1] : walletUtils.createPrivateKeyList(),
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      // @ts-ignore
      accounts: process.env.PRIVATE_KEY1 !== undefined ? [process.env.PRIVATE_KEY1] : walletUtils.createPrivateKeyList(),
    },
    hardhat: {
      forking: {
        url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        accounts: process.env.PRIVATE_KEY1 !== undefined ? [process.env.PRIVATE_KEY1] : walletUtils.createPrivateKeyList(),
        blockNumber: 49086266
      }
    }
  },
  etherscan: {
    apiKey: `${process.env.POLYGONSCAN_API_KEY}`,
  },
  solidity: {
    compilers: [
      {
        version: '0.8.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
            details: { yul: false },
          },
        },
      },
      {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
            details: { yul: false },
          },
        },
      },
    ],
  },
};

module.exports = config;