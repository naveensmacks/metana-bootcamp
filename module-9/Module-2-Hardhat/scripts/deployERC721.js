const { ethers, upgrades } = require("hardhat");

async function main() {
    const ERC721Token = await ethers.getContractFactory("MyERC721TokenUpgradeable");
    console.log("Deploying MyERC721TokenUpgradeable...");
    const erc721Token = await upgrades.deployProxy(ERC721Token, [], { initializer: 'initialize' });
    await erc721Token.deployed();
    console.log("MyERC721TokenUpgradeable deployed to:", erc721Token.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
