const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  console.log("Deploying Raffle and waiting for Block Confirmations");
  const Raffle = await deploy("Raffle", {
    contract: "Raffle",
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`Raffle deployed at ${Raffle.address}`);
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(Raffle.address, []);
  }
  log("__________________________________________");
};
module.exports.tags = ["all", "raffle"];
