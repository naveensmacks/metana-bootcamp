// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TicketingAppv2 is VRFConsumerBaseV2,Ownable,ERC721Enumerable, ReentrancyGuard {
    uint256 public registrationEndTime;
    mapping(address => bool) public hasRegistered;
    address[] public registrants;
    address[] public selectedWinners;
    mapping(address => bool) public isSelectedWinner;
    mapping(uint256 => address) public ticketOwner;
    uint32 public MAX_PARTICIPANTS;
    uint32 public MAX_TICKETS;
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 s_subscriptionId;
    bytes32 keyHash;
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;

    using Counters for Counters.Counter;
    Counters.Counter private _ticketIds;

    uint256 public ticketPrice = 1 gwei;

    // Chainlink VRF Coordinator addresses and LINK token addresses vary by network
    constructor(uint64 subscriptionId, address vrfCoordinator, bytes32 _keyHash, uint32 maxParticipants, uint32 maxTickets)
        VRFConsumerBaseV2(vrfCoordinator) 
        ERC721("GameTicket", "GTCKT") {
        registrationEndTime = block.timestamp + (2 minutes); //
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
        keyHash = _keyHash;
        MAX_PARTICIPANTS = maxParticipants;
        MAX_TICKETS = maxTickets;
    }

    modifier registrationClosed {
        require(block.timestamp > registrationEndTime, "Registration period is not closed yet.");
        _;
    }

    modifier registrationOpen {
        require(block.timestamp <= registrationEndTime, "Registration period is closed.");
        _;
    }

    //remove address add in final release - use msg.sender where ever applicable
    function register() public {
        address add = msg.sender;
        require(block.timestamp <= registrationEndTime, "Registration period has ended.");
        require(!hasRegistered[add], "Sender has already registered.");
        require(registrants.length < MAX_PARTICIPANTS, "Registration limit reached.");
        //registrants.push(msg.sender);
        registrants.push(add);//doing this for the purpose of testing in harhat, in prod needs to be changed to msg.sender
        hasRegistered[add] = true;
    }

    function drawWinners() public registrationClosed{
        if(MAX_TICKETS < registrants.length) {
          // Request randomness
          COORDINATOR.requestRandomWords(
              keyHash,
              s_subscriptionId,
              requestConfirmations,
              callbackGasLimit,
              MAX_TICKETS
          );
        } else{
          //since total participants are less the max_tickets all the participants are eligible to buy tickets
          uint256 totalRegistrants = registrants.length;
          for (uint256 i = 0; i < totalRegistrants ; i++) {
            selectedWinners.push(registrants[i]);
            registrants[i] = registrants[totalRegistrants - 1];
            registrants.pop();
            totalRegistrants--;
            isSelectedWinner[selectedWinners[i]] = true;
          }
        }
    }

    function fulfillRandomWords(uint256 /* requestId */, uint256[] memory randomWords) internal override {
        uint256 totalRegistrants = registrants.length;
        uint256 winnersCount = 0;
        //uint256 noOfRandoms = MAX_TICKETS<totalRegistrants?MAX_TICKETS:totalRegistrants;
        for (uint256 i = 0; winnersCount < MAX_TICKETS && i < randomWords.length; i++) {
            uint256 index = randomWords[i] % totalRegistrants;
            selectedWinners.push(registrants[index]);
            winnersCount++;

            // Remove the selected winner to avoid duplicates
            registrants[index] = registrants[totalRegistrants - 1];
            registrants.pop();
            totalRegistrants--;
            isSelectedWinner[selectedWinners[i]] = true;
        }
    }

    //mints ticket nfts for the eligible winners
    function buyTicket() public payable nonReentrant registrationClosed {
        require(block.timestamp > registrationEndTime, "Registration period is still open.");
        require(isSelectedWinner[msg.sender], "You must be a selected winner to buy a ticket.");
        require(msg.value == ticketPrice, "Incorrect ticket price.");

        _ticketIds.increment();
        uint256 newTicketId = _ticketIds.current();
        _safeMint(msg.sender, newTicketId);
        ticketOwner[newTicketId] = msg.sender;
    }

    function transferTicket(uint256 ticketId, address to) public registrationClosed{
        require(ownerOf(ticketId) == msg.sender, "You must own the ticket to transfer it.");
        require(msg.sender != to, "You cannot transfer the ticket to yourself.");

        // Transfer the ticket for the same price
        // Note: This simplistic approach does not handle the transfer of funds. In a real scenario, you'd want to
        // ensure that the recipient pays the ticket price to the current owner, potentially through an escrow mechanism
        // or by using the marketplace functionality.
        _transfer(msg.sender, to, ticketId);
    }

    //below methods are for settings the configs for the event like ticketprice, no of tickets, ticketprice and registration end time
    //accessible only by contract owner
    function setMaxTickets(uint32 maxTickets) external onlyOwner registrationOpen {
      MAX_TICKETS = maxTickets;
    }

    function setTicketPrice(uint256 _ticketPrice) external onlyOwner registrationOpen {
      ticketPrice = _ticketPrice;
    }

    function setMaxParticipants(uint32 maxParticipants) external onlyOwner registrationOpen {
      MAX_PARTICIPANTS = maxParticipants;
    }

    function increaseRegistrationEndTime(uint8 time) external onlyOwner {
      if(time==0) {
        registrationEndTime = block.timestamp + 5 minutes;
      } else if(time==1) {
        registrationEndTime = block.timestamp + 1 hours;
      } else if(time==2) {
        registrationEndTime = block.timestamp + 2 days;
      }
    }

    function closeRegistration() external onlyOwner {
      registrationEndTime = 0;
    }
}
