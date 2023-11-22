require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { API_MAINNET_URL } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  //solidity: "0.7.6",
  //took from Uniswap/v3-periphery to avoid the error - "Stack too deep when compiling inline assembly"
  solidity: {
    compilers: [
      {
        version: "0.7.6",
        settings: {
          evmVersion: "istanbul",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
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

