const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { network, ethers } = require("hardhat");

//address on mainnet
const WALLET_ADDRESS = "0xE46203ca942c4bA1A9249B6B9B27A79761819606";
const WETH10_ADDRESS = "0xf4BB2e28688e89fCcE3c0580D37d36A7672E8A9F";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("FlashMint", function () {
  let flashMintContract, signer, weth10Contract;
  async function testSwapUniswap() {
    //impersonate account parameters
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [WALLET_ADDRESS],
    });

    //instance of signer
    signer = await ethers.getSigner(WALLET_ADDRESS);

    //instace of WETH10
    weth10Contract = await ethers.getContractAt("IERC20", WETH10_ADDRESS);

    //instance of FlashMint
    const Flash = await ethers.getContractFactory("TestWethFlashMint");
    flashMintContract = await Flash.deploy();

    return { flashMintContract, signer, weth10Contract };
  }

  describe("Flash mint", function () {
    it("Update all the storage variables from the onFlashLoan()", async function () {
      const { flashMintContract, signer, weth10Contract } = await loadFixture(testSwapUniswap);
      const ZERO = "0";
      const ZERO_BYTES = "0x";

      //expect all the storage variables from the contract to be the default
      expect(await flashMintContract.sender()).to.be.equal(ZERO_ADDRESS);
      expect(await flashMintContract.token()).to.be.equal(ZERO_ADDRESS);
      expect(await flashMintContract.borrower()).to.be.equal(ZERO_ADDRESS);

      const flashTx = await flashMintContract.connect(signer).flash();
      const receipt = await flashTx.wait();
      console.log("After Flash Mint");
      console.log("Sender   ", await flashMintContract.sender());
      console.log("Token    ", await flashMintContract.token());
      console.log("Borrower ", await flashMintContract.borrower());

      //filtering logs only for the TestUniswapFlashSwap address
      const logsForContract = receipt.logs.filter((log) => log.address === flashMintContract.address);

      const LogEvent = new ethers.utils.Interface(["event Log(string message, uint val)"]);
      console.log("Below are the Log events from the contract");
      for (const log of logsForContract) {
          const decodedLog =  LogEvent.decodeEventLog("Log", log.data, log.topics);
          const message = decodedLog.message;
          const val = decodedLog.val.toString();
          console.log(message, " ", val);
       }
      
    });
  });
});
