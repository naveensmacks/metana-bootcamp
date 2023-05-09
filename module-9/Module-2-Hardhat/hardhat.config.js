require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");
require('dotenv').config();
require("@nomiclabs/hardhat-etherscan");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],

    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  solidity: "0.8.18",
};
//Deploying MyERC20TokenUpgradeable...
//MyERC20TokenUpgradeable deployed to: 0x049F7AC3e119B2f7275f9514a17e549e56Bda224
// imple : 0xb38Dd2475aaAb91a26AabbA79CA7F17FeA0F0821

//Deploying MyERC721TokenUpgradeable...
//MyERC721TokenUpgradeable deployed to: 0x23d829C6ADc01AF4625348cCa6c2f96670FFcae2
// imple : 0x57a8d6b83CB11c67BC15566DC0d7ECf902aEccBD
// impleV2 : 0x28933425D1CC11ED778ae10f5bFD8E0E4E4730d7

//Deploying MyStakingContractUpgradeable...
//MyStakingContractUpgradeable deployed to: 0xC119aFD9e85357fA5a2C06EB543963c876d6b97b
// imple : 0x3FeDb24cb85ac793cb8e6A958EC0031b8837bbdC