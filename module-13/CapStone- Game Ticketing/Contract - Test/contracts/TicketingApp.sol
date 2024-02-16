// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

contract TicketingApp is VRFConsumerBaseV2 {
    uint256 public registrationEndTime;
    mapping(address => bool) public hasRegistered;
    address[] public registrants;
    address[] public selectedWinners;
    uint32 public immutable MAX_PARTICIPANTS;
    uint32 public immutable MAX_WINNERS;
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 s_subscriptionId;
    bytes32 keyHash;
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;

    // Chainlink VRF Coordinator addresses and LINK token addresses vary by network
    constructor(uint64 subscriptionId, address vrfCoordinator, bytes32 _keyHash, uint32 maxParticipants, uint32 maxTickets)
        VRFConsumerBaseV2(vrfCoordinator) {
        registrationEndTime = block.timestamp + (2 minutes); // Registration open for 2 days
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
        keyHash = _keyHash;
        MAX_PARTICIPANTS = maxParticipants;
        MAX_WINNERS = maxTickets;
    }

    //remove address add in final release - use msg.sender where ever applicable
    function register(address add) public {
        //uncomment below line in final release      
        //require(block.timestamp <= registrationEndTime, "Registration period has ended.");
        require(!hasRegistered[add], "Sender has already registered.");
        require(registrants.length < MAX_PARTICIPANTS, "Registration limit reached.");
        //registrants.push(msg.sender);
        registrants.push(add);//doing this for the purpose of testing in harhat, in prod needs to be changed to msg.sender
        hasRegistered[add] = true;
    }

    function drawWinners() public {
        require(block.timestamp > registrationEndTime, "Registration period is still open.");
        // Request randomness
        COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            MAX_WINNERS
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
