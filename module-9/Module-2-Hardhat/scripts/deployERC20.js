const { ethers, upgrades } = require("hardhat");

async function main() {
    const ERC20Token = await ethers.getContractFactory("MyERC20TokenUpgradeable");
    console.log("Deploying MyERC20TokenUpgradeable...");
    const erc20Token = await upgrades.deployProxy(ERC20Token, [], { initializer: 'initialize' });
    await erc20Token.deployed();
    console.log("MyERC20TokenUpgradeable deployed to:", erc20Token.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
