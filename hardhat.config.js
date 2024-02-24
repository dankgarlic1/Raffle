require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("hardhat-deploy");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-gas-reporter");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("dotenv").config();

const COINMARKETCAP_API_KEY = process.env.COIN_MARKET_CAP_API_KEY;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "www.aabracadabra.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
module.exports = {
  solidity: "0.8.8",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1,
      // gasPrice: 130000000000,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6, //two reasons why we add this: 1) >>>Security 2) Give etherscan chance to index the transaction
    },
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
