const { ethers } = require("ethers");
const SIGNING_DOMAIN_NAME = "Voucher-Domain"
const SIGNING_DOMAIN_VERSION = "1"
const chainId = 1
const contractAddress = "0xd9145CCE52D386f254917e481eB44e9943F39138" // Put the address here from remix
const signer = new ethers.Wallet("503f38a9c967ed597e47fe25643985f032b072db8075426a92110f82df48dfcb") // private key that I use for address 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4

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
main();