// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

// https://uniswap.org/docs/v2/smart-contracts

interface IUniswapV2Router {

  function swapExactTokensForTokens(
    uint amountIn,
    uint amountOutMin,
    address[] calldata path,
    address to,
    uint deadline
  ) external returns (uint[] memory amounts);

}
