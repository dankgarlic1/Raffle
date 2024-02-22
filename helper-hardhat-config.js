const { ethers } = require("hardhat");

const networkConfig = {
  31337: {
    name: "Hardhat",
    entranceFee: ethers.parseEther("0.01"),
    gasLane:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", //doesn't matter what we use here because we will already be mocking the Gas lane
    callbackGasLimit: "500000",
    subscriptionId: "10",
    interval: "30",
    vrfCoordinatorV2: "0x5FbDB2315678afecb367f032d93F642f64180aa3", //hardcoding it here because it always deploy mocks at this address in Hardhat
  },
  11155111: {
    name: "Sepolia",
    ethPriceUsd: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    entranceFee: ethers.parseEther("0.01"),
    gasLane:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    subscriptionId: "0",
    callbackGasLimit: "500000",
    interval: "30",
  },
};
const developmentChains = ["hardhat", "localhost"];
module.exports = {
  networkConfig,
  developmentChains,
};
