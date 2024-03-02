// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

error Raffle__notEnoughEthSent();
error Raffle__TransferFailed();
error Raffle_notOwner();
error Raffle__NotOpen();
error Raffle__UpkeepNotNeeded(
    uint256 currentBalance,
    uint256 numPlayers,
    uint256 raffleState
);

/**
 * @title Raffle Contract
 * @author Harshit Raizada
 * @notice This contract is for creating an umtamperable decentralized smart contract
 * @dev This implements ChainlinkVRF2 and Chainlink Keepers
 */

contract Raffle is VRFConsumerBaseV2, AutomationCompatibleInterface {
    /* Type Declarations */
    enum RaffleState {
        OPEN,
        CALCULATING
    }

    /* State Variables */
    address payable[] private s_players;
    address private immutable i_owner;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint256 private immutable i_entranceFee;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint32 private constant NUM_WORDS = 1;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    bytes32 private immutable i_gasLane; //also known as keyHash in chainlink docs

    /* Lottery Variables */
    address public s_recentWinner;
    RaffleState private s_raffleState;
    uint256 private s_lastTimeStamp;
    uint256 private immutable i_interval;

    /* Events */
    event RaffleEnter(address indexed players);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    constructor(
        uint256 enteranceFee,
        uint256 interval,
        address vrfCoordinatorV2, //contract
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        bytes32 gasLane
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entranceFee = enteranceFee;
        i_owner = msg.sender;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        i_gasLane = gasLane;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_interval = interval;
    }

    /* Functions */

    // enter raffle by paying some amount
    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) {
            revert Raffle__notEnoughEthSent();
        }

        s_players.push(payable(msg.sender));
        // Emit an event when we update a dynamic array or mapping
        // Naming conevntion for making events is reversing the name,
        // for eg. th event for this function will be RaffleEnter()

        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__NotOpen();
        }

        emit RaffleEnter(msg.sender);
    }

    function fulfillRandomWords(
        uint256 /*requestId*/,
        uint256[] memory randomWords
    ) internal override {
        //Pick a random Winner (Verifiably random)
        // winner to be selected every few minutes, months etc. -> complete Automation
        //Chainlink Oracle -> Randomness, automated execution (Chainlink Keepers)
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        s_raffleState = RaffleState.OPEN;
        s_players = new address payable[](0); //reseting the array after picking the winner
        s_lastTimeStamp = 0;

        (bool callSuccess, ) = recentWinner.call{value: address(this).balance}(
            ""
        );
        // require(callSuccess, "fail");
        if (!callSuccess) {
            revert Raffle__TransferFailed();
        }
        emit WinnerPicked(recentWinner);
    }

    /**
     * @dev This is the function that the Chainlink Keeper nodes call
     * they look for `upkeepNeeded` to return True.
     * the following should be true for this to return true:
     * 1. The time interval has passed between raffle runs.
     * 2. The lottery is open.
     * 3. The contract has ETH.
     * 4. Implicity, your subscription is funded with LINK.
     */

    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory /*performamce data*/)
    {
        bool isOpen = RaffleState.OPEN == s_raffleState; //meaning the bool is true if RaffleState.OPEN == s_raffleState
        //time passed =  block.timeStamp - lastTimeStamp >interval
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);

        bool hasPlayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (timePassed && hasPlayers && hasBalance && isOpen); //if this returns we generate new Random number for another raffle bout
        return (upkeepNeeded, "0x0");
    }

    /**
     * @dev Once `checkUpkeep` is returning `true`, this function is called
     * and it kicks off a Chainlink VRF call to get a random winner.
     */

    function performUpkeep(bytes calldata /* performData */) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        // require(upkeepNeeded, "Upkeep not needed");
        if (!upkeepNeeded) {
            revert Raffle__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }
        s_raffleState = RaffleState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        emit RequestedRaffleWinner(requestId);
    }

    /* View/Pure Functions */

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayers(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getVRFCoordinator()
        public
        view
        returns (VRFCoordinatorV2Interface)
    {
        return i_vrfCoordinator;
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getRequestConfirmation() public pure returns (uint16) {
        return REQUEST_CONFIRMATIONS;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    function getSubscriptionId() public view returns (uint64) {
        return i_subscriptionId;
    }

    function getGasLane() public view returns (bytes32) {
        return i_gasLane;
    }

    function getCallbackGasLimit() public view returns (uint32) {
        return i_callbackGasLimit;
    }
}
