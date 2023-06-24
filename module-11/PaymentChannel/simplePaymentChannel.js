
/*
The recipient should verify each message using the following process:
	1	Verify that the contract address in the message matches the payment channel.
	2	Verify that the new total is the expected amount.
	3	Verify that the new total does not exceed the amount of ether escrowed.
	4	Verify that the signature is valid and comes from the payment channel sender.
The first three steps are straightforward. The final step can be performed a number of ways, but if it’s being done in JavaScript, I recommend the ethereumjs-util library. The following code borrows the constructMessage function from the signing code above:
*/
// This mimics the prefixing behavior of the eth_sign JSON-RPC method.
function prefixed(hash) {
  return ethereumjs.ABI.soliditySHA3(
    ["string", "bytes32"],
    ["\x19Ethereum Signed Message:\n32", hash]
  );
}

function recoverSigner(message, signature) {
  var split = ethereumjs.Util.fromRpcSig(signature);
  var publicKey = ethereumjs.Util.ecrecover(message, split.v, split.r, split.s);
  var signer = ethereumjs.Util.pubToAddress(publicKey).toString("hex");
  return signer;
}

function isValidSignature(contractAddress, amount, signature, expectedSigner) {
  var message = prefixed(constructPaymentMessage(contractAddress, amount));
  var signer = recoverSigner(message, signature);
  return signer.toLowerCase() ==
    ethereumjs.Util.stripHexPrefix(expectedSigner).toLowerCase();
}
