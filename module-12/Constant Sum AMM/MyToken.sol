// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("Token 2", "TKN2") {
        _mint(msg.sender, 100000);
    }

    function mint (uint256 num) external {
         _mint(msg.sender, num);
    }
}
