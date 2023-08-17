import React, { useState } from 'react';
import { ethers } from 'ethers';
import { BigNumber } from 'ethers';

const WalletGenerator = () => {
  const [address, setAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const [nonce, setNonce] = useState('');
  const [textboxContent, setTextboxContent] = useState('');
  const [hashedMessage, setHashedMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [amount, setAmount] = useState('');
  const [toAddress, setToAddress] = useState('');

  const ALCHEMY_API_KEY = 'xkmT4FvUJR7KyBMbMXnL5-9m7f-GSMrO';

  const createNewAccount = () => {
    // Step 1: Generate a random private key
    const privateKeyBytes = ethers.utils.randomBytes(32);
    console.log("privateKeyBytes :", privateKeyBytes);
    const newPrivateKey = ethers.utils.hexlify(privateKeyBytes);
    console.log("newPrivateKey :", newPrivateKey);

    // Step 2: Derive the public key and Ethereum address
    const wallet = new ethers.Wallet(newPrivateKey);
    console.log("wallet :", wallet);
    console.log("publicKey :", wallet.publicKey);
    const newAddress = wallet.address;
    console.log("newAddress :", newAddress);

    // Update the state with the new address and private key
    setAddress(newAddress);
    setPrivateKey(newPrivateKey);


    // Step 3: Generate a nonce (can be a simple counter or timestamp)
    const newNonce = Math.floor(Math.random() * 100000); // Replace with appropriate nonce generation logic

    // Update the state with the new nonce
    setNonce(newNonce);
  };

   //Calculate hash
   const calculateHash = (content, nonce) => {
    //HASH MESSAGE + CURRENT NONCE TO PREVENT REPLAY ATTACK
    //const messageToHash = content + nonce.toString();
    //const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(messageToHash));
    const hash = ethers.utils.solidityKeccak256(["string", "uint256"], [content, nonce]);
    return hash;
  };


  //Update hash when textbox content changes
  const handleTextboxChange = (event) => {
    const newTextboxContent = event.target.value;
    setTextboxContent(newTextboxContent);
    const hash = calculateHash(newTextboxContent, nonce);
    setHashedMessage(hash);
  };

  // Implement Unstructured Signing
  const signHash = async (hash, wallet) => {
    const signature = await wallet.signMessage(hash);
    return signature;
  };

  // Display Signature on Button Click
  const handleSignButtonClick = async () => {
    const provider = new ethers.providers.AlchemyProvider("goerli", ALCHEMY_API_KEY);
    console.log("provider: ", provider);
    const wallet = new ethers.Wallet(privateKey, provider);

    const hashToSign = ethers.utils.id(textboxContent + nonce); // Create a raw hash
    const newSignature = await signHash(hashToSign, wallet);
    setSignature(newSignature);
  };

  // Implement Transaction Signing
  const signTransaction = async (transaction, wallet) => {
    console.log("inside signTransaction");
    const signedTransaction = await wallet.signTransaction(transaction);
    console.log("after signTransaction");
    return signedTransaction;
  };

  // Estimate Gas for the Transaction
  const estimateGas = async (transaction, provider) => {
    const estimatedGas = await provider.estimateGas(transaction);
    return estimatedGas;
  };

  // Handle Transaction Submission
  const handleSendButtonClick = async () => {
    try {
      console.log("inside handleSendButtonClick");
      const provider = new ethers.providers.AlchemyProvider("goerli", ALCHEMY_API_KEY);
      const wallet = new ethers.Wallet(privateKey, provider);

      const nonceValue = await wallet.getTransactionCount();
      console.log("amount", amount);
      console.log("amount in hexa", BigNumber.from(amount).toHexString());
      console.log("nonceValue", nonceValue);
      const transaction = {
        nonce: nonceValue,
        gasLimit: ethers.utils.hexlify(21000), // Default gas limit for regular transactions
        gasPrice: ethers.utils.parseUnits("20", "gwei"), // Example gas price
        to: toAddress,
        value: BigNumber.from(amount).toHexString(),
      };
      console.log("transaction.value : ",transaction.value);
      const estimatedGas = await estimateGas(transaction, provider);
      console.log("Estimated Gas : ",estimatedGas);
      transaction.gasLimit = estimatedGas;

      const signedTransaction = await signTransaction(transaction, wallet);
      console.log("signedTransaction : ",signedTransaction);
      // Send the transaction
      const txResponse = await provider.sendTransaction(signedTransaction);

      console.log("Transaction sent:", txResponse);
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  return (
    <div>
      <button onClick={createNewAccount}>Create a New Account</button>
      {address && <p>Ethereum Address: {address}</p>}
      {privateKey && <p>Private Key: {privateKey}</p>}

      {nonce && (
        <div>
          <label>Hash the message + current Nonce : </label>
          <input type="text" value={textboxContent} onChange={handleTextboxChange}  placeholder={"Insert your message here"} />
          <p>Hashed Message: {hashedMessage}</p>
        </div>
      )}

      {nonce && (
        <div>
          <button onClick={handleSignButtonClick}>Sign the Hash</button>
          {signature && <p>Signature: {signature}</p>}
        </div>
      )}

      <div>
        <label>Amount in wei:</label>
        <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <div>
        <label>To Address:</label>
        <input type="text" value={toAddress} onChange={(e) => setToAddress(e.target.value)} />
      </div>
      <button onClick={handleSendButtonClick}>Send Transaction</button>
    </div>
  );
};

export default WalletGenerator;
