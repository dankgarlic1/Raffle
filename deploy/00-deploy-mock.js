const { Network, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async ({ getNamesAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamesAccounts();
  const chainId = Network.config.chainId;

  if (developmentChains.includes(network.name)) {
    log("Local network detected, Deplpying mocks");

    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: [],
    });
  }
};
