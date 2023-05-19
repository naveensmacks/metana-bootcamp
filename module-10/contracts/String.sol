// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract String {
    function charAt(
        string memory input,
        uint index
    ) public pure returns (bytes2) {
        bytes2 result = 0x0000;
        assembly {
            if lt(index, mload(input)) {
                result := shl(8, mload(add(add(input, 0x20), index)))
            }
        }
        return result;
    }
}



// Add following test cases for String contract: 
// charAt(“abcdef”, 2) should return 0x6300
// charAt(“”, 0) should return 0x0000
// charAt(“george”, 10) should return 0x0000