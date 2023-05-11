const { ethers, upgrades } = require("hardhat");

async function main() {
    const tokenAddress = "0x049F7AC3e119B2f7275f9514a17e549e56Bda224";
    const nftAddress = "0x23d829C6ADc01AF4625348cCa6c2f96670FFcae2";

    const StakingContract = await ethers.getContractFactory("MyStakingContractUpgradeable");
    console.log("Deploying MyStakingContractUpgradeable...");
    const stakingContract = await upgrades.deployProxy(StakingContract, [tokenAddress, nftAddress], { initializer: 'initialize' });
    await stakingContract.deployed();
    console.log("MyStakingContractUpgradeable deployed to:", stakingContract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
