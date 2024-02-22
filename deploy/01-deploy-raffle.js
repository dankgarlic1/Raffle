const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const { vrfCoordinatorV2MockAddress } = require("./00-deploy-mock");
console.log(
  `Vrf Coordinator mock address from mock deployment script: ${vrfCoordinatorV2MockAddress}`
);
require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let subscriptionId, vrfCoordinatorV2Mock;
  console.log("Deploying Raffle and waiting for Block Confirmations");
  if (developmentChains.includes(network.name)) {
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
    // vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    log(`Mock Address: ${vrfCoordinatorV2MockAddress}`); //from mock deployment script
    const transactionResposne = await vrfCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transactionResposne.wait();
    // log(transactionResposne);
    // log(transactionReciept);
    // subscriptionId = transactionReceipt.events[0].args.subId; //check the function in mock, it emists an event and gives subId
    subscriptionId = transactionReceipt.logs[0].args.subId;
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"];
    subscriptionId = networkConfig[chainId]["subscriptionId"];
  }

  const entranceFee = networkConfig[chainId]["entranceFee"];
  const gasLane = networkConfig[chainId]["gasLane"];
  const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
  const interval = networkConfig[chainId]["interval"];
  log(
    `Mock Contract Address which will be passed in args: ${vrfCoordinatorV2MockAddress}`
  );

  const args = [
    entranceFee,
    interval,
    "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    subscriptionId,
    callbackGasLimit,
    gasLane,
  ]; //args for Raffle.sol contract

  // console.log("Arguments for Raffle deployment:");
  // args.forEach((arg, index) => {
  //   console.log(`Arg[${index}]: ${arg}`);
  // });

  const Raffle = await deploy("Raffle", {
    contract: "Raffle",
    from: deployer,
    args: args,
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
