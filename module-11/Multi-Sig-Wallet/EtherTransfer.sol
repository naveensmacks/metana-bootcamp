// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EtherTransfer {
    function transferEther(address payable recipient) public payable {
        require(msg.value > 0, "No Ether sent");

        recipient.transfer(msg.value);
    }
}