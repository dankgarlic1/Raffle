// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.8;

error Raffle__notEnoughEthSent();
error Raffle_notOwner();

contract Raffle {
    /* State Variables */
    uint256 private immutable i_entranceFee;
    address private immutable i_owner;
    mapping(address => uint) public addressToAmount;
    address payable[] private s_players;

    /* Events */
    event RaffleEnter(address indexed players);

    /* Modifier */

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert Raffle_notOwner();
        }
        _;
    }

    constructor(uint256 enteranceFee) {
        i_entranceFee = enteranceFee;
        i_owner = msg.sender;
    }

    //enter raffle by paying some amount
    function enterRaffle() public payable {
        if (msg.value <= i_entranceFee) {
            revert Raffle__notEnoughEthSent();
        }
        s_players.push(payable(msg.sender));
        // Emit an event when we update a dynamic array or mapping
        // Naming conevntion for making events is reversing the name,
        // for eg. th event for this function will be RaffleEnter()

        emit RaffleEnter(msg.sender);
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayers(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    //Pick a random Winner (Verifiably random)
    // winner to be selected every few minutes, months etc. -> complete Automation

    //Chainlink Oracle -> Randomness, automated execution (Chainlink Keepers)
}
