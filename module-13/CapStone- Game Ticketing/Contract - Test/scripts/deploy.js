// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { vrfCoordinatorAddress, subscriptionId, keyhash } = require("../config");

async function main() {
  const ticketingApp = await hre.ethers.deployContract("TicketingApp", [subscriptionId, vrfCoordinatorAddress, keyhash,10, 2]);

  await ticketingApp.waitForDeployment();

  console.log("TicketingApp deployed to address:", ticketingApp.target);
  //sepolia deployed address: 0x1B66B137265b20D153B9Ca6037fCE6271FDFb7eb
  //then added this address as consumer in vrf.chain.link
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
