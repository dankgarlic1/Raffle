const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");
// const { assert } = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle", async function () {
      let raffle;
      let vrfCoordinatorV2Mock;
      let deployer;
      let raffleEntranceFee;
      const chainId = network.config.chainId;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
        // raffleEntranceFee = networkConfig[chainId]["entranceFee"];
        raffleEntranceFee = await raffle.getEntranceFee();
        console.log(`Raffle Entrance Fee: ${raffleEntranceFee}`);
      });
      describe("Constructor", async function () {
        it("Initializes the Raffle correctly", async function () {
          const raffleState = await raffle.getRaffleState();
          const interval = await raffle.getInterval();
          const vrfCoordinatorV2 = await raffle.getVRFCoordinator();
          const entranceFee = await raffle.getEntranceFee();
          const subId = await raffle.getSubscriptionId();
          const gasLane = await raffle.getGasLane();
          const callbackGasLimit = await raffle.getCallbackGasLimit();

          assert.equal(raffleState.toString(), "0");
          assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
          assert.equal(
            entranceFee.toString(),
            networkConfig[chainId]["entranceFee"]
          );
          assert.equal(
            vrfCoordinatorV2.toString(),
            networkConfig[chainId]["vrfCoordinatorV2"]
          );
          assert.equal(
            subId.toString(),
            networkConfig[chainId]["subscriptionId"]
          );
          assert.equal(gasLane.toString(), networkConfig[chainId]["gasLane"]);
          assert.equal(
            callbackGasLimit.toString(),
            networkConfig[chainId]["callbackGasLimit"]
          );
        });
      });

      describe("enterRaffle", async function () {
        it("Reverts when you don't pay enough", async () => {
          await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
            raffle,
            "Raffle__notEnoughEthSent"
          );
        });
        it("Pushes the participants into the array", async function () {
          await raffle.enterRaffle({ raffleEntranceFee });
          const playerFromContract = await raffle.getPlayers(0);
          assert.equal(playerFromContract.toString(), deployer);
        });
      });
    });
