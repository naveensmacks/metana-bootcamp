const { ethers } = require('hardhat');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const { expect } = require('chai');

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
      console.log("randomSet : ", randomSet);
      return true;
    }
  }

  throw new Error(`Event ${eventName} with expected arguments not found`);
}


describe('ERC721MerkleDrop', function () {
  console.log("1");
  before(async function() {
    console.log("2");
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

  describe('Mint all elements', function () {
    console.log("3");
    before(async function() {
      console.log("4");
      this.merkleDropNft = await deploy('MerkleDropNft', 'Naveen', 'NAV', this.merkleTree.getHexRoot(), 0, 20);
    });
    console.log("5");
    let index = 0;
    it('element', async function () {
      const maxRandomValue = 20;
      const randomSet = new Set();
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
   });
  });
});