import React, { useState } from 'react';
import { ethers } from 'ethers';

const WalletGenerator = () => {
  const [address, setAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');

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
  };

  return (
    <div>
      <button onClick={createNewAccount}>Create a New Account</button>
      {address && <p>Ethereum Address: {address}</p>}
      {privateKey && <p>Private Key: {privateKey}</p>}
    </div>
  );
};

export default WalletGenerator;
