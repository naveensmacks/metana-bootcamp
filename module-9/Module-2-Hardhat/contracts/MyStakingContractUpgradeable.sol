// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./MyERC20TokenUpgradeable.sol";
import "./MyERC721TokenUpgradeable.sol";

contract MyStakingContractUpgradeable is IERC721Receiver {
    uint256 constant REWARDS_PER_HOUR = 10 * 10**18;
    uint256 constant SECONDS_IN_A_DAY = 24 * 60 * 60;

    MyERC20TokenUpgradeable private _token;
    IERC721Upgradeable private _nft;

    mapping(uint256 => address) private _originalOwner;
    mapping(address => uint256) private _stakeCount;
    mapping(address => uint256) private _lastStakedTime;
    mapping(address => mapping(uint256 => uint256)) private _tokenTime;

    function initialize(address tokenAddress, address nftAddress) public {
        _token = MyERC20TokenUpgradeable(tokenAddress);
        _nft = IERC721Upgradeable(nftAddress);
    }

        function onERC721Received(
        address,
        address from,
        uint256 tokenId,
        bytes memory
    ) external override returns (bytes4) {
        require(msg.sender == address(_nft), "Only accepts ERC721 tokens from specific contract");
        uint256 blockTimeStamp = block.timestamp;
        require(blockTimeStamp - _lastStakedTime[from] >= 24 hours, "Can only stake one NFT per 24 hours");
        _tokenTime[from][_stakeCount[from]] = blockTimeStamp;
        _stakeCount[from] += 1;
        _lastStakedTime[from] = blockTimeStamp;
        _originalOwner[tokenId] = from;
        _token.mint(from, 10 * 10**18);
        return this.onERC721Received.selector;
    }

    function withdraw(uint256 tokenId) public {
        require(_stakeCount[msg.sender] > 0, "You haven't staked any NFT yet");
        require(_originalOwner[tokenId] == msg.sender, "Invalid Token Id");
        _stakeCount[msg.sender] -= 1;
        uint256 tokenTimeStamp = _tokenTime[msg.sender][_stakeCount[msg.sender]];
        uint256 timeDiff = block.timestamp - tokenTimeStamp;
        require(timeDiff > 24 hours, "Cannot withdraw an NFT before 24 hours");
        uint256 rewardAmount = (timeDiff * REWARDS_PER_HOUR) / SECONDS_IN_A_DAY;
        _token.mint(msg.sender, rewardAmount);
        _nft.safeTransferFrom(address(this), msg.sender, tokenId);
    }

    function originalOwner(uint256 tokenId) public view returns (address) {
        return _originalOwner[tokenId];
    }

    function stakeCount(address user) public view returns (uint256) {
        return _stakeCount[user];
    }

    function lastStakedTime(address user) public view returns (uint256) {
        return _lastStakedTime[user];
    }

    function tokenTime(address user, uint256 index) public view returns (uint256) {
        return _tokenTime[user][index];
    }
}

   
