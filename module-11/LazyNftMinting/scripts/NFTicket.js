const { ethers } = require("ethers");

//1. Update the contract address
//2. Update the DOMAIN_NAME and VERSION with the same info of the current contract
//3. Update buyer's address
//4. Generate the signature

//~~~~~~ Constants to generate the signature ~~~~~~
const SIGNER_GANACHE = new ethers.Wallet("503f38a9c967ed597e47fe25643985f032b072db8075426a92110f82df48dfcb") // private key that I use for address 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4

const domain = {
  name: SIGNING_DOMAIN_NAME,
  version: SIGNING_DOMAIN_VERSION,
  verifyingContract: contractAddress,
  chainId
}

async function createVoucher(tokenId, price, uri, buyer) {
  const voucher = { tokenId, price, uri, buyer }
  const types = {
    LazyNFTVoucher: [
      {name: "tokenId", type: "uint256"},
      {name: "price", type: "uint256"},
      {name: "uri", type: "string"},
      {name: "buyer", type: "address"}
    ]
  }

  const signature = await signer._signTypedData(domain, types, voucher)
  return {
    ...voucher,
    signature
  }
}

async function main() {
  const voucher = await createVoucher(5, 50, "uri", "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4") // the address is the address which receives the NFT
  console.log(`[${voucher.tokenId}, ${voucher.price}, "${voucher.uri}", "${voucher.buyer}", "${voucher.signature}"]`)
}
</script>
</body>
</html>

const DOMAIN_NAME = "Voucher-Domain"; //Same as the smart contract
const VERSION = "1"; //Same as the smart contract

const CHAIN_ID = "1";
const CONTRACT_ADDRESS = "0xd9145CCE52D386f254917e481eB44e9943F39138"; // Put the address here from remix
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
  const buyer = "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2";
  const price = "1000000000000000000";
  const uri = `ipfs://./${tokenId}`;
  const result = await createNFTicket(tokenId, buyer, price, uri);
  console.log(result);
  console.log(`["${result.tokenId}", "${result.buyer}", "${result.price}", "${result.uri}", "${result.SIGNATURE}"]`);
}
sellTicket();