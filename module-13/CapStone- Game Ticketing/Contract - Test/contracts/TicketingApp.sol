// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

contract TicketingApp is VRFConsumerBaseV2 {
    uint256 public registrationEndTime;
    address[] public registrants;
    address[] public selectedWinners;
    uint256 public constant MAX_WINNERS = 100;
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 s_subscriptionId;
    bytes32 keyHash;
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords =  MAX_WINNERS;

    // Chainlink VRF Coordinator addresses and LINK token addresses vary by network
    constructor(uint64 subscriptionId, address vrfCoordinator, bytes32 _keyHash)
        VRFConsumerBaseV2(vrfCoordinator) {
        registrationEndTime = block.timestamp + (2 days); // Registration open for 2 days
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
        keyHash = _keyHash;
    }

    function register() public {
        require(block.timestamp <= registrationEndTime, "Registration period has ended.");
        require(registrants.length < 1500, "Registration limit reached.");
        registrants.push(msg.sender);
    }

    function drawWinners() public {
        require(block.timestamp > registrationEndTime, "Registration period is still open.");
        // Request randomness
        COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
    }

    function fulfillRandomWords(uint256 /* requestId */, uint256[] memory randomWords) internal override {
        uint256 totalRegistrants = registrants.length;
        uint256 winnersCount = 0;

        for (uint256 i = 0; winnersCount < MAX_WINNERS && i < randomWords.length; i++) {
            uint256 index = randomWords[i] % totalRegistrants;
            selectedWinners.push(registrants[index]);
            winnersCount++;

            // Remove the selected winner to avoid duplicates
            registrants[index] = registrants[totalRegistrants - 1];
            registrants.pop();
            totalRegistrants--;
        }
    }
}
