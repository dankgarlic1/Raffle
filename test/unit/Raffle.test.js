const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");
const { assert } = require("chai");
// const { assert } = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle", async function () {
      let raffle;
      let vrfCoordinatorV2Mock;
      let deployer;
      const chainId = network.config.chainId;

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
      });
      describe("Constructor", async function () {
        it("Initializes the Raffle correctly correctly", async function () {
          //   const vrfCoordinatorAddress = await raffle.getVRFCoordinator();
          //   const set_vrfCoordinatorAddress =
          //     networkConfig[chainId]["vrfCoordinatorV2"];
          //   assert.equal(
          //     vrfCoordinatorAddress.toString(),
          //     set_vrfCoordinatorAddress.toString()
          //   );
          const raffleState = await raffle.getRaffleState();
          const interval = await raffle.getInterval();

          assert.equal(raffleState.toString(), "0");
          assert.equal(interval, networkConfig[chainId]["interval"]);
        });
      });
    });
