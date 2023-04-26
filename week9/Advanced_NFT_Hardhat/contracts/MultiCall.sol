// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MultiCall {
    struct Call {
        address target;
        bytes callData;
    }

    function aggregate(Call[] memory calls) public returns (bytes[] memory returnData) {
        returnData = new bytes[](calls.length);
        for (uint256 i = 0; i < calls.length; i++) {
            (bool success, bytes memory data) = calls[i].target.call(calls[i].callData);
            require(success, "Multicall::aggregate: call failed");
            returnData[i] = data;
        }
    }
}