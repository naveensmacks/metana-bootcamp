const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { network, ethers } = require("hardhat");

//address on mainnet
const { DAI_ADDRESS, DAI_WHALE } = require("./config");

describe("Swap", function () {
  let flashSwapContract, signer, daiContract;
  async function testSwapUniswap() {
    //impersonate account parameters
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE],
    });

    //instance of signer
    signer = await ethers.getSigner(DAI_WHALE);

    //instace of DAI
    daiContract = await ethers.getContractAt("IERC20", DAI_ADDRESS);

    const Flash = await ethers.getContractFactory("TestUniswapFlashSwap");
    flashSwapContract = await Flash.deploy();

    return { flashSwapContract, signer, daiContract };
  }

  describe("Flash swap, borrow 1million DAI", function () {
    it.only("Should borrow 1m DAI token", async function () {
      const { flashSwapContract, signer, daiContract } = await loadFixture(testSwapUniswap);
      const tokenToBorrow = daiContract.address;
      const amountToBorrow = ethers.utils.parseEther("10000");

      //check balance before the TX
      const balanceBefore = await daiContract.balanceOf(signer.address);

      //1 transfer dai token to the flashSwap contract this is to cover the fee 0.3% here we transfered all of whale's token
      const transfer = await daiContract.connect(signer).transfer(flashSwapContract.address, balanceBefore);
      await transfer.wait();

      //2 flash swap
      const borrowTx = await flashSwapContract.connect(signer).testFlashSwap(tokenToBorrow, amountToBorrow);
      const receipt = await borrowTx.wait();
      //console.log("LOGS:", receipt.logs);
    
      //filtering logs only for the TestUniswapFlashSwap address
      const logsForContract = receipt.logs.filter((log) => log.address === flashSwapContract.address);

      const LogEvent = new ethers.utils.Interface(["event Log(string message, uint val)"]);
      console.log("Below are the Log events from the contract");
      for (const log of logsForContract) {
        //filtering only log events - not required the TestUniswapFlashSwap contract only has one event which is log
        if (log.topics[0] === ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Log(string,uint256)"))) {
          //or you can also pass LogEvent.getEvent("Log") instead of "Log"
          const decodedLog =  LogEvent.decodeEventLog("Log", log.data, log.topics);
          const message = decodedLog.message;
          const val = decodedLog.val.toString();
          console.log(message, " ", val);
        }
      }
    });
  });
});