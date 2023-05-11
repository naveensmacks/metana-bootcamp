// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MyERC721TokenUpgradeableV2 is ERC721Upgradeable, OwnableUpgradeable {

    function mint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }

    function godTransfer(address from, address to, uint256 tokenId) public onlyOwner {
        _transfer(from, to, tokenId);
    }
}
