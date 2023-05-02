// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";

contract GuessContract {
    function getNumber() external view returns (uint8){
        require(!Address.isContract(msg.sender), "Is a contract");
        // Some code that is vulnerable to be called by another contract
        return 255;
    }

    function getNumbeSafe() external view returns (uint8){
        require(msg.sender == tx.origin, "Is a contract");
        // Some code that cannot by called by another contract
        return 255;
    }
}

contract HackContract1 {
    uint8 public number;
    constructor(address add){
        GuessContract gs = GuessContract(add);
        number = gs.getNumber();
    }
}


contract HackContract2 {
    uint8 public number;
    constructor(address add){
        GuessContract gs = GuessContract(add);
        number = gs.getNumbeSafe();
    }
}