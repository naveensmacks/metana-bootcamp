const { ethers } = require('hardhat');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const { expect } = require('chai');
const hre = require("hardhat");

async function deploy(name, ...params) {
  const Contract = await ethers.getContractFactory(name);
  return await Contract.deploy(...params).then(f => f.deployed());
}

function hashToken(index,account) {
  return Buffer.from(ethers.utils.solidityKeccak256(["address","uint8"], [account,index]).slice(2), 'hex');
}

async function asyncAssertEmittedEvent(contract, eventName, expectedArgs, maxRandomValue, randomSet, blockNumber) {
  console.log("blockNumber : ",  blockNumber);
  const events = await contract.queryFilter(eventName, blockNumber);
  for (const event of events) {
    let allMatch = true;

    for (const [key, value] of Object.entries(expectedArgs)) {
      if (event.args[key] !== value) {
        allMatch = false;
        break;
      }
    }

    if (allMatch) {
      const random = event.args.random;
      expect(random).to.be.lte(maxRandomValue); // Check if the random number is not greater than the maximum allowed value
      expect(randomSet.has(random)).to.be.false; // Check if the random number is unique
      randomSet.add(random); // Add the random number to the set
      return true;
    }
  }

  throw new Error(`Event ${eventName} with expected arguments not found`);
}


describe('ERC721MerkleDrop', function () {
  before(async function() {
    this.accounts = await ethers.getSigners();
    this.addresses = this.accounts.map(account => account.address);
    console.log("addresses : ", this.addresses);
    let index = 0;
    const hashedAddresses = this.accounts.map((account) => {
      index++;
      return hashToken(index, account.address);
    });
    //console.log("hashedAddresses : ", hashedAddresses);
    //const hashedAddresses = Object.entries(tokens).map(token => hashToken(...token));
    this.merkleTree = new MerkleTree(hashedAddresses, keccak256, { sortPairs: true });
  });

  describe('Operations', function () {
    before(async function() {
      this.merkleDropNft = await deploy('MerkleDropNft', 'Naveen', 'NAV', this.merkleTree.getHexRoot(), 0, 20);
    });
    let index = 0;
    this.finalRandomSet = new Set();
    it('Mint all Tokens', async function () {
      const maxRandomValue = 20;
      let randomSet = new Set();
      while (index < this.accounts.length) {
        console.log("index : ", index);
        /**
         * Create merkle proof (anyone with knowledge of the merkle tree)
         */
        console.log("6");
        const account = this.addresses[index];
        console.log("account : ", account);
        const proof = this.merkleTree.getHexProof(hashToken(index+1, account));
        console.log("proof : ",proof);
        /**
         * Redeems token using merkle proof (anyone with the proof)
         */
        const revealHash = ethers.utils.hexZeroPad(ethers.utils.hexlify(index+1), 32);
        console.log("revealHash : ",revealHash);
        const dataHash = await this.merkleDropNft.getHash(revealHash);
        console.log("dataHash : ",dataHash);
        await expect(this.merkleDropNft.connect(this.accounts[index]).commit(account, index+1, dataHash, proof))
          .to.emit(this.merkleDropNft, 'CommitHash')
          .withArgs(account, dataHash);
        //Advancing 10 blocks ahead...
        for (let i = 0; i < 10; i++) {
          await hre.network.provider.send("evm_mine");
        }
        const tx = await this.merkleDropNft.connect(this.accounts[index]).reveal(revealHash);
        const receipt = tx.wait();
        console.log("receipt.blockNumber : ", receipt.blockNumber);
          // .to.emit(this.merkleDropNft, 'RevealHash')
          // .withArgs(account, revealHash, ethers.BigNumber.from(0));
        await asyncAssertEmittedEvent(this.merkleDropNft, "RevealHash", {
          sender: account,
          revealHash: revealHash,
        }, maxRandomValue, randomSet, receipt.blockNumber);
        index++;
      }
      this.finalRandomSet = randomSet;
      console.log("randomSet : ", this.finalRandomSet);
   });
   it('Minting Ended', async function () {
    await expect(this.merkleDropNft.connect(this.accounts[0]).commit(this.accounts[0].address, 1,ethers.utils.hexZeroPad(ethers.utils.hexlify(0), 32), []))
      .to.be.rejectedWith("Not in Minting state");
   });
   it('Transfer Tokens', async function () {
    const tokenArray = Array.from(this.finalRandomSet);
    console.log("Array : ", tokenArray);
    await this.merkleDropNft.connect(this.accounts[1]).transferFrom(this.accounts[1].address, this.accounts[0].address, tokenArray[1]);
    await this.merkleDropNft.connect(this.accounts[2]).transferFrom(this.accounts[2].address, this.accounts[0].address, tokenArray[2]);
    await this.merkleDropNft.connect(this.accounts[3]).transferFrom(this.accounts[3].address, this.accounts[0].address, tokenArray[3]);
    expect(await this.merkleDropNft.balanceOf(this.accounts[0].address)).to.equal(ethers.BigNumber.from("4"));

    expect(await this.merkleDropNft.balanceOf(this.accounts[1].address)).to.equal(ethers.BigNumber.from("0"));
    expect(await this.merkleDropNft.balanceOf(this.accounts[2].address)).to.equal(ethers.BigNumber.from("0"));
    expect(await this.merkleDropNft.balanceOf(this.accounts[3].address)).to.equal(ethers.BigNumber.from("0"));
    
    const multiCall = await deploy('MultiCall');

    //Transfer back those three tokens back to the same addresses using multiCall
    const transfers = [
      { recipient: this.accounts[1].address, tokenId: tokenArray[1] },
      { recipient: this.accounts[2].address, tokenId: tokenArray[2] },
      { recipient: this.accounts[3].address, tokenId: tokenArray[3] }
    ];

    const transferFunctionSignatures = transfers.map(() => 'safeTransferFrom(address,address,uint256)');
    console.log("transferFunctionSignatures : ", transferFunctionSignatures);

    const transferFunctionArguments = transfers.map(transfer => [
      this.accounts[0].address,
      transfer.recipient,
      transfer.tokenId
    ]);
    console.log("transferFunctionArguments :" ,transferFunctionArguments);
    const calls = transferFunctionSignatures.map((signature, i) =>
      [this.merkleDropNft.address, this.merkleDropNft.interface.encodeFunctionData(signature, transferFunctionArguments[i])]
    );
    console.log("call : ", calls);
    
    // Approve the Multicall contract to manage the user's NFTs
    await this.merkleDropNft.setApprovalForAll(multiCall.address, true);

    const tx = await multiCall.aggregate(calls);
    const receipt = await tx.wait();

    // Assert the token balances
    expect(await this.merkleDropNft.balanceOf(this.accounts[0].address)).to.equal(ethers.BigNumber.from("1"));
    expect(await this.merkleDropNft.balanceOf(this.accounts[1].address)).to.equal(ethers.BigNumber.from("1"));
    expect(await this.merkleDropNft.balanceOf(this.accounts[2].address)).to.equal(ethers.BigNumber.from("1"));
    expect(await this.merkleDropNft.balanceOf(this.accounts[3].address)).to.equal(ethers.BigNumber.from("1"));
   });

   it('Nft sale', async function () {
    const tokenArray = Array.from(this.finalRandomSet);
    await expect(this.merkleDropNft.connect(this.accounts[0]).buyToken(tokenArray[0])).to.be.rejectedWith("NFT Token is Not For Sale");
    await this.merkleDropNft.setTokenPrice(tokenArray[0],ethers.utils.parseEther("1"));
    await expect(this.merkleDropNft.buyToken(20)).to.be.rejectedWith("Invalid TokenId");
    await expect(this.merkleDropNft.connect(this.accounts[1]).buyToken(tokenArray[0])).to.be.rejectedWith("Not enough ether to buy the token");
    await this.merkleDropNft.connect(this.accounts[1]).buyToken(tokenArray[0], { value: ethers.utils.parseEther("1") });
    expect(await this.merkleDropNft.balanceOf(this.accounts[0].address)).to.equal(ethers.BigNumber.from("0"));
    expect(await this.merkleDropNft.balanceOf(this.accounts[1].address)).to.equal(ethers.BigNumber.from("2"));
    const beforeBalance = await ethers.provider.getBalance(this.accounts[0].address);
    console.log(" before balance : ",beforeBalance);
    await this.merkleDropNft.withdrawCredits();
    const afterBalance = await ethers.provider.getBalance(this.accounts[0].address);
    console.log(" after balance : ",afterBalance);
    expect(beforeBalance).to.be.lessThan(afterBalance);
   });
  });
});