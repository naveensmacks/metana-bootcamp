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

    // using inline assembly code
    function charAtAsm(string memory input, uint index) public pure returns (uint, uint, bytes32, bytes1) {
        uint length;
        uint dataStart;
        bytes32 byteVal;
        uint8 char;
        assembly {
            length := mload(input)
            dataStart := add(input, 0x20)
            if lt(index, length) {
                let charPos := add(dataStart, index)
                byteVal := mload(charPos)
                char := byte(0, byteVal) // load the rightmost byte only
            }
        }
        return (length, dataStart, byteVal, bytes1(char));
    }
}

// Add following test cases for String contract: 
// charAt("abcdef", 2) should return 0x6300
// charAt("", 0) should return 0x0000
// charAt("george", 10) should return 0x0000
