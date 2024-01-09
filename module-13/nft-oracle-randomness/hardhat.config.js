require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const { SEPOLIA_RPC_URL, PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: `${SEPOLIA_RPC_URL}`,
      accounts: [`0x${PRIVATE_KEY}`]
    },
  },
};
