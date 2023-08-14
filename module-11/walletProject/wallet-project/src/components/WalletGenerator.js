import React, { useState } from 'react';
import { ethers } from 'ethers';

const WalletGenerator = () => {
  const [address, setAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const [nonce, setNonce] = useState('');
  const [textboxContent, setTextboxContent] = useState('');
  const [hashedMessage, setHashedMessage] = useState('');
  const [signature, setSignature] = useState('');
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
    </div>
  );
};

export default WalletGenerator;
