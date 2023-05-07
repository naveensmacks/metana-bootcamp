// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MyERC20TokenUpgradeable is ERC20Upgradeable, OwnableUpgradeable {
    uint256 private _initSupply;
    address private _marketAddress;

    function initialize() public initializer {
        __ERC20_init("My ERC20 Token", "MERC20");
        __Ownable_init();
        _initSupply = 10000 * (10**uint256(decimals()));
        _mint(msg.sender, _initSupply);
    }

    modifier onlyMarket {
        require(msg.sender == _marketAddress, "Not allowed to mint, Only Market place can mint");
        _;
    }

    function marketAddress() public view returns (address) {
        return _marketAddress;
    }

    function setAuthority(address marketAddress_) external onlyOwner {
        _marketAddress = marketAddress_;
    }

    function mint(address to, uint256 amount) public onlyMarket {
        _mint(to, amount);
    }
}
