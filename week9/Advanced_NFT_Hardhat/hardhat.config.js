require("@nomicfoundation/hardhat-toolbox");

//require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');
require('hardhat-gas-reporter');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
};

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();
  let count = 0;
  for (const account of accounts) {
    console.log(account.address);
    count++;
  }
  console.log("Total Number of accounts : ",count)
});
