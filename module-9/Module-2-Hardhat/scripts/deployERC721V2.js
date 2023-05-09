// scripts/upgrade.js
const { ethers, upgrades } = require("hardhat");

async function main() {
    const PROXY_NFT_ADDRESS = "0x23d829C6ADc01AF4625348cCa6c2f96670FFcae2";
    const MyNFTUpgradeableV2 = await ethers.getContractFactory("MyERC721TokenUpgradeableV2");
    const myNFT = await upgrades.upgradeProxy(PROXY_NFT_ADDRESS, MyNFTUpgradeableV2);
    console.log("MyNFT upgraded:", myNFT.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
