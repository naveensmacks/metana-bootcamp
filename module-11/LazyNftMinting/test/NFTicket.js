const { ethers } = require("ethers");

//1. Update the contract address
//2. Update the DOMAIN_NAME and VERSION with the same info of the current contract
//3. Update buyer's address
//4. Generate the signature

//~~~~~~ Constants to generate the signature ~~~~~~
const SIGNER_GANACHE = new ethers.Wallet("");
const DOMAIN_NAME = "Vouchers-Santiago"; //Same as the smart contract
const VERSION = "1"; //Same as the smart contract

const CHAIN_ID = "1";
const CONTRACT_ADDRESS = "";
//Create domain, types and ticket
async function createNFTicket(tokenId, buyer, price, uri) {
  const domain = {
    name: DOMAIN_NAME,
    version: VERSION,
    verifyingContract: CONTRACT_ADDRESS,
    chainId: CHAIN_ID,
  };
  const types = {
    NFTicket: [
      { name: "tokenId", type: "uint256" },
      { name: "buyer", type: "address" },
      { name: "price", type: "uint256" },
      { name: "uri", type: "string" },
    ],
  };
  const ticket = { tokenId, buyer, price, uri };

  const SIGNATURE = await SIGNER_GANACHE._signTypedData(domain, types, ticket);
  return {
    ...ticket,
    SIGNATURE,
  };
}

//Call createNFTicket() from this function
async function sellTicket() {
  const tokenId = "2";
  const buyer = "";
  const price = "1000000000000000000";
  const uri = `ipfs://./${tokenId}`;
  const result = await createNFTicket(tokenId, buyer, price, uri);
  console.log(result);
  console.log(`["${result.tokenId}", "${result.buyer}", "${result.price}", "${result.uri}", "${result.SIGNATURE}"]`);
}
sellTicket();