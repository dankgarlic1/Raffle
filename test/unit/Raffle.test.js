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
      let raffleContract;
      let vrfCoordinatorV2Mock;
      let player;
      let raffleEntranceFee;

      const chainId = network.config.chainId;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        //   deployer = accounts[0]
        player = accounts[1];
        await deployments.fixture(["mocks", "raffle"]);
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock"); // Returns a new connection to the VRFCoordinatorV2Mock contract
        raffleContract = await ethers.getContract("Raffle"); // Returns a new connection to the Raffle contract
        raffle = raffleContract.connect(player); // Returns a new instance of the Raffle contract connected to player

        // raffleEntranceFee = networkConfig[chainId]["entranceFee"];
        raffleEntranceFee = await raffle.getEntranceFee();
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
        it("reverts when you don't pay enough", async () => {
          await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
            raffle,
            "Raffle__notEnoughEthSent"
          );
        });

        it("records player when they enter", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          const contractPlayer = await raffle.getPlayers(0);
          assert.equal(player.address, contractPlayer);
        });
        it("Emits an event", async () => {
          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.be.emit(raffle, "RaffleEnter");
        });
      });
    });
