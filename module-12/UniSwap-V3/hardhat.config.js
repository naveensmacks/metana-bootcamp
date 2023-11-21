require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { API_MAINNET_URL } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.7.6",
  networks: {
    hardhat: {
      forking: {
        url: `${API_MAINNET_URL}`,
        //blockNumber: 18283565,
        blockNumber: 18512577,
      },
    },
  },
};

