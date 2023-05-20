// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract String {
    function charAt(string memory input, uint index) public pure returns (bytes2) {
        bytes memory inputBytes = bytes(input);
        if (index >= inputBytes.length) {
            return 0x0000;
        } else {
            return bytes2(inputBytes[index]);
        }
    }
}

// Add following test cases for String contract:
// charAt(“abcdef”, 2) should return 0x6300
// charAt(“”, 0) should return 0x0000
// charAt(“george”, 10) should return 0x0000
