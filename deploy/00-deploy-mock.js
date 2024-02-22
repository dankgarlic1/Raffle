const { Network, network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
let vrfCoordinatorV2MockAddress;

/* CONSTRUCTOR arguments of VRFCoordinatorV2Mock */
const BASE_FEE = ethers.parseEther("0.25"); //it is 0.25 premium or 0.25 LINK on chainlink Docs, supported networks
const GAS_PRICE_LINK = 1e9; //calculated value based upon the gas of the chain, I have set this value randomly here
//Chain link nodes pay gas fees to give us randomness and call external functions,
//so price of requests change baased on price of gas

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (developmentChains.includes(network.name)) {
    log("Local network detected, Deploying mocks");

    const vrfCoordinatorV2Mock = await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: [BASE_FEE, GAS_PRICE_LINK],
      waitConfirmations: network.config.blockConfirmations || 1,
    });

    vrfCoordinatorV2MockAddress = vrfCoordinatorV2Mock.address;

    log("Mocks deployed");
    log(`VRFCoordinatorV2Mock deployed at: ${vrfCoordinatorV2MockAddress}`);
    log("------------------------------------------------");
  }
};
module.exports.tags = ["all", "mocks"];
module.exports.vrfCoordinatorV2MockAddress = vrfCoordinatorV2MockAddress;
