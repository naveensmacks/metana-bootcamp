import React, { useState } from 'react';
import { ethers } from 'ethers';
import { BigNumber } from 'ethers';
import '../styles.css';
import {MessageModal, ErrorModal} from './Modals';

const WalletGenerator = () => {
  const [showCreateButton, setShowCreateButton] = useState(true);
  const [showImportForm, setShowImportForm] = useState(false);
  const [address, setAddress] = useState('');
  const [enterKey, setEnterKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showHashFields, setShowHashFields] = useState(false);
  const [showTransactionFields, setShowTransactionFields] = useState(false);

  const [nonce, setNonce] = useState('');
  const [textboxContent, setTextboxContent] = useState('');
  const [hashedMessage, setHashedMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [amount, setAmount] = useState('');
  const [toAddress, setToAddress] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [balance, setBalance] = useState('');

  const ALCHEMY_API_KEY = 'xkmT4FvUJR7KyBMbMXnL5-9m7f-GSMrO';

  const enterKeyChangeHandler = (event) => {
    setEnterKey(event.target.value);
  };
  
  const importExistingAccount = () => {
    try {
      console.log("enterKey :", enterKey);
      const newPrivateKey = ethers.utils.hexlify(enterKey);
      console.log("newPrivateKey :", newPrivateKey);
      const wallet = new ethers.Wallet(newPrivateKey);
      // Update the state with the new address and private key
      setAddress(wallet.address);
      console.log("newPrivateKey : {}, wallet.address : {}",newPrivateKey,wallet.address)
      setPrivateKey(newPrivateKey);

      const newNonce = Math.floor(Math.random() * 100000);

      setNonce(newNonce);
      setShowCreateButton(false);
    } catch (error) {
      console.error("Error importExistingAccount", error);
      setShowErrorModal(true);
      setErrorMessage("Error in importing existing account, Invalid private key");
    }
  }
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
    setShowCreateButton(false);
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

  // Common function to prepare transaction data
  const prepareTransaction = async () => {
    const provider = new ethers.providers.AlchemyProvider("goerli", ALCHEMY_API_KEY);
    const wallet = new ethers.Wallet(privateKey, provider);

    const nonceValue = await wallet.getTransactionCount();
    const transaction = {
      nonce: nonceValue,
      gasLimit: ethers.utils.hexlify(21000), // Default gas limit for regular transactions
      gasPrice: ethers.utils.parseUnits("20", "gwei"), // Example gas price
      to: toAddress,
      value: BigNumber.from(amount).toHexString(),
    };

    const estimatedGas = await estimateGas(transaction, provider);
    transaction.gasLimit = estimatedGas;

    return { provider, wallet, transaction };
  };

    // Handle Transaction Submission
  const handleSendButtonClick = async () => {
    try {
      const { transaction } = await prepareTransaction();

      // Show the modal with estimated gas value
      setShowModal(true);
      setEstimatedGas(transaction.gasLimit.toString()); // Set estimated gas value from previous calculation

    } catch (error) {
      console.error("Error preparing transaction:", error);
      setShowErrorModal(true);
      setErrorMessage("Error in preparing transaction, invalid To Address");
    }
  };

  // Handle Execution of Transaction
  const handleExecuteTransaction = async () => {
    try {
      const { provider, wallet, transaction } = await prepareTransaction();
      const signedTransaction = await signTransaction(transaction, wallet);

      // Send the transaction
      const txResponse = await provider.sendTransaction(signedTransaction);

      console.log("Transaction sent:", txResponse);
      // Display transaction executed message
      alert("Transaction executed successfully!");
    } catch (error) {
      console.error("Error sending transaction:", error);
      setShowErrorModal(true);
      setErrorMessage("Cannot perform the transaction, insufficient funds");
    } finally {
      // Close the modal after the transaction is executed
      setShowModal(false);
    }
  };
  
  const fetchBalance = async () => {
    try {
      const provider = new ethers.providers.AlchemyProvider("goerli", ALCHEMY_API_KEY);
      const wallet = new ethers.Wallet(privateKey, provider);

      const balanceInWei = await provider.getBalance(wallet.address);
      console.log("Balance: ", balanceInWei);
      const balanceInEther = ethers.utils.formatEther(balanceInWei);
      setBalance(balanceInEther);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>My Wallet</h1>
      </div>
      {showCreateButton && (
        <div>
        <button onClick={createNewAccount}>Create a New Account </button>
        <br></br>
        <div className="components">
          <button
            className="heading-button"
            onClick={() => setShowImportForm(!showImportForm)}>
            Import an existing Account
          </button>

          <div className={`${showImportForm ? "expanded" : "expanding"}`}>
            <label>Enter the Private Key:</label>
            <input type="text" value={enterKey} onChange={enterKeyChangeHandler}/>
            <button onClick={importExistingAccount}>Import Account</button>
          </div>
        </div>
        </div>
      )}
      {address && <p>Ethereum Address: {address}</p>}
      {privateKey && <p>Private Key: {privateKey}</p>}
      
      {address && (
        <div>
          <button onClick={fetchBalance}>Balance</button>
          {balance !== "" && <label> {balance} ETH </label>}
        </div>
      )}

      {nonce && (
        <div className="components">
          <button
            className="heading-button"
            onClick={() => setShowHashFields(!showHashFields)}
          >
            Sign Message
          </button>

          <div className={`${showHashFields ? "expanded" : "expanding"}`}>
            <label>Hash the message + current Nonce:</label>
            <input
              type="text"
              value={textboxContent}
              onChange={handleTextboxChange}
            />
            <p>
              <label>Hashed Message:</label> {hashedMessage}
            </p>
            <button onClick={handleSignButtonClick}>Sign the Hash</button>
            {signature && (
              <p>
                <label>Signature:</label> {signature}
              </p>
            )}
          </div>
        </div>
      )}

      {!showCreateButton && (
        <div className="components">
          <button
            className="heading-button"
            onClick={() => setShowTransactionFields(!showTransactionFields)}
          >
            Send Ether
          </button>
          <div
            className={`${showTransactionFields ? "expanded" : "expanding"}`}
          >
            <div>
              <label>Amount in wei:</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label>To Address:</label>
              <input
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
              />
            </div>
            <button onClick={handleSendButtonClick}>Send Transaction</button>
          </div>
        </div>
      )}
      <MessageModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        estimatedGas={estimatedGas}
        handleExecuteTransaction = {handleExecuteTransaction}
      />
      <ErrorModal
        showErrorModal={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default WalletGenerator;
