require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();
const COINMARKETCAP_API_KEY = process.env.COIN_MARKET_CAP_API_KEY;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
module.exports = {
  solidity: "0.8.8",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      // gasPrice: 130000000000,
    },
    // sepolia: {
    //   url: SEPOLIA_RPC_URL,
    //   accounts: [PRIVATE_KEY],
    //   chainId: 11155111,
    //   blockConfirmations: 6, //two reasons why we add this: 1) >>>Security 2) Give etherscan chance to index the transaction
    // },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
    // customChains: [], // uncomment this line if you are getting a TypeError: customChains is not iterable
  },
  gasReporter: {
    enabled: false,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
  scripts: {
    // Specify the directory where scripts are located
    deploy: "./deploy",
  },
  tags: {
    // Define your tags here
    all: {
      contracts: "*",
    },
    mocks: {
      contracts: "mock*",
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
    player: {
      //added player to differentiate between users who are playing
      default: 1,
    },
  },
};
