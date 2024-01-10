// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
// scripts/deploy.js

const hre = require("hardhat");
const { vrfCoordinatorAddress, subscriptionId, keyhash } = require("../config");

async function main() {
  const advancedCollectible = await hre.ethers.deployContract(
    "AdvancedCollectible",
    [vrfCoordinatorAddress, subscriptionId, keyhash]
  );
  await advancedCollectible.waitForDeployment(); 
  console.log("AdvancedCollectible deployed to address:", advancedCollectible.target);
  //sepolia deployed address: 0xA5Ba55E75BC8820EE08B77b05A8702ef181181c1
  //updated subId and deployed: 0xDFcaC9F177F78a699e5879568762f339D3c796AE
}

main().then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
