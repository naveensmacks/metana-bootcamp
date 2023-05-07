// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MyERC721TokenUpgradeable is ERC721Upgradeable, OwnableUpgradeable {
    function initialize() public initializer {
        __ERC721_init("My ERC721 Token", "MERC721");
        __Ownable_init();
    }

    function mint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }
}
