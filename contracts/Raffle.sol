// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.8;

error Raffle__notEnoughEthSent();

contract Raffle {
    uint256 private immutable i_entranceFee;
    mapping(address => uint) public addressToAmount;

    address payable[] private s_players;

    constructor(uint256 enteranceFee) {
        i_entranceFee = enteranceFee;
    }

    //enter raffle by paying some amount
    function enterRaffle() public payable {
        if (msg.value <= i_entranceFee) {
            revert Raffle__notEnoughEthSent();
        }
        s_players.push(payable(msg.sender));
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayers(uint256 index) public view returns (address) {
        return s_players[index];
    }

    //Pick a random Winner (Vrifiably random)
    // winner to be selected every few minutes, months etc. -> complete Automation

    //Chainlink Oracle -> Randomness, automated execution (Chainlink Keepers)
}
