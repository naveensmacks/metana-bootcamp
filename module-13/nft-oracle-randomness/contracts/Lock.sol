// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract Lock {
    uint public unlockTime;
    address payable public owner;
    enum Breed{PUG, SHIBA_INU, ST_BERNARD}

    event Withdrawal(uint amount, uint when, string name, Breed dog);

    constructor(uint _unlockTime) payable {
        require(
            block.timestamp < _unlockTime,
            "Unlock time should be in the future"
        );

        unlockTime = _unlockTime;
        owner = payable(msg.sender);
    }

    function withdraw() public {
        // Uncomment this line, and the import of "hardhat/console.sol", to print a log in your terminal
        // console.log("Unlock time is %o and block timestamp is %o", unlockTime, block.timestamp);

        require(block.timestamp >= unlockTime, "You can't withdraw yet");
        require(msg.sender == owner, "You aren't the owner");
        console.log("before Emit");
        emit Withdrawal(address(this).balance, block.timestamp, "naveen", Breed.SHIBA_INU);
        console.log("After Emit");
        owner.transfer(address(this).balance);
    }
}
