const { network, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");
// const { assert } = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle", function () {
      let raffle;
      let raffleContract;
      let vrfCoordinatorV2Mock;
      let player;
      let raffleEntranceFee;
      let interval;

      const chainId = network.config.chainId;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        //   deployer = accounts[0]
        player = accounts[1];
        await deployments.fixture(["mocks", "raffle"]);
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock"); // Returns a new connection to the VRFCoordinatorV2Mock contract
        raffleContract = await ethers.getContract("Raffle"); // Returns a new connection to the Raffle contract
        raffle = raffleContract.connect(player); // Returns a new instance of the Raffle contract connected to player
        interval = await raffle.getInterval();

        raffleEntranceFee = await raffle.getEntranceFee();
      });
      describe("Constructor", function () {
        it("Initializes the Raffle correctly", async function () {
          const raffleState = await raffle.getRaffleState();
          const vrfCoordinatorV2Interface = await raffle.getVRFCoordinator();
          const subId = await raffle.getSubscriptionId();
          const gasLane = await raffle.getGasLane();
          const callbackGasLimit = await raffle.getCallbackGasLimit();

          assert.equal(raffleState.toString(), "0");
          assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
          assert.equal(
            raffleEntranceFee.toString(),
            networkConfig[chainId]["entranceFee"]
          );
          assert.equal(
            vrfCoordinatorV2Interface.toString(),
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

      describe("enterRaffle", function () {
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
        it("Cannot enter the raffle when it is closed", async () => {
          /**
           * To test if we can enter the raffle when it is calculating/closed,
           * For that performUpkeep function must be called and that can be called only when checkupkeep  function returns true
           * For checkUpkeep function to return true, three conditions should be met
           * 1) Time should have passed(interval which we set in config)
           * 2) no. of players>0
           * 3) Contract should have balance(which we will have automatically since some player must have entered the raffle)
           */
          await raffle.enterRaffle({ value: raffleEntranceFee });

          await network.provider.send("evm_increaseTime", [
            Number(interval) + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          console.log(typeof Number(interval));
          //we need to pretend to be a keeper for a second
          await raffle.performUpkeep("0x"); //changes state to calculating
          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.be.revertedWithCustomError(raffle, "Raffle__NotOpen");
        });
      });
      describe("checkUpkeep", function () {
        it("Returns False if no one has entered the Raffle", async () => {
          await network.provider.send("evm_increaseTime", [
            Number(interval) + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x"); //simulates calling this with staticCall
          assert(!upkeepNeeded);
        });
        it("returns false if raffle isn't open", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            Number(interval) + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          await raffle.performUpkeep("0x"); // changes the state to calculating
          const raffleState = await raffle.getRaffleState(); // stores the new state
          const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x"); // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
          assert.equal(raffleState.toString() == "1", upkeepNeeded == false);
        });
        it("Returns False if Time has not passed", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            Number(interval) - 4,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x");
          assert(!upkeepNeeded);
        });
        it("Returns true if it has players, balance, raffle is open and Time has passed", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee }); //add players and balance
          await network.provider.send("evm_increaseTime", [
            Number(interval) + 1,
          ]); //passes the time
          await network.provider.request({ method: "evm_mine", params: [] });
          const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x"); //opens the raffle
          assert(upkeepNeeded);
        });
      });
      describe("performUpkeep", function () {
        it("Can only run if checkUpkeep returns true", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            Number(interval) + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          const tx = raffle.performUpkeep("0x");
          assert(tx);
        });

        it("If checkUpkeep returns false it Reverts", async () => {
          await expect(
            raffle.performUpkeep("0x")
          ).to.be.revertedWithCustomError(raffle, "Raffle__UpkeepNotNeeded");
        });
        it("Updates the Raffle state", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            Number(interval) + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          await raffle.performUpkeep("0x");
          const raffleState = await raffle.getRaffleState();
          assert(raffleState == 1); //1 means calculating, 0 means open
        });
        it("Emits a requestId", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            Number(interval) + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          const tx = await raffle.performUpkeep("0x");
          const txResposne = await tx.wait(1);
          const txReciept = txResposne.logs[1].args.requestId;
          assert(Number(txReciept) > 0);
        });
      });
      describe("fulfillRandomWords", function () {
        beforeEach(async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            Number(interval) + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
        });
        it("Called after performUpkeep", async () => {
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.getAddress())
          ).to.be.revertedWith("nonexistent request");
        });
      });
    });
