/*For the hash generated on the client to match the one generated in the smart contract, the arguments must be concatenated in the same way.

You can find browser builds of ethereumjs-abi in the ethereumjs/browser-builds repository.
The ethereumjs-abi library provides a function called soliditySHA3 that mimics the behavior of Solidity’s keccak256 function. It accepts an array of values as well as an array of their Solidity types so it can serialize the values accordingly.


Putting it all together, here’s a JavaScript function that creates the proper signature for the ReceiverPays example:
*/
// recipient is the address that should be paid.
// amount, in wei, specifies how much ether should be sent.
// nonce can be any unique number, used to prevent replay attacks.
// contractAddress is used to prevent cross-contract replay attacks.
function signPayment(recipient, amount, nonce, contractAddress, callback) {
  var hash = "0x" + ethereumjs.ABI.soliditySHA3(
    ["address", "uint256", "uint256", "address"],
    [recipient, amount, nonce, contractAddress]
  ).toString("hex");

  web3.personal.sign(hash, web3.eth.defaultAccount, callback);
}
