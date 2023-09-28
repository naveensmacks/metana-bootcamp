// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StakeToken is ERC20 {
    constructor() ERC20("StakeToken", "ST",) {
        _mint(msg.sender, 100000);
    }

    function mint (uint256 num) external {
         _mint(msg.sender, num);
    }
}

contract RewardToken is ERC20 {
    constructor() ERC20("RewardToken", "RT",) {
        _mint(msg.sender, 100000);
    }

    function mint (uint256 num) external {
         _mint(msg.sender, num);
    }
}
