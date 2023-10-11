const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { network, ethers } = require("hardhat");
//address on mainnet
const { DAI_ADDRESS, WBTC_ADDRESS, DAI_WHALE } = require("./config");

describe("Swap", function () {
  let daiContract, daiWhaleSigner, wbtcContract;
  async function testSwapUniswap() {
    //impersonate account parameters
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE],
    });
  
    console.log("DAI_WHALE:{}:",DAI_WHALE);
    //instance of signer
    daiWhaleSigner = await ethers.getSigner(DAI_WHALE);
    //instace of DAI
    daiContract = await ethers.getContractAt("IERC20", DAI_ADDRESS);
    //instace of WBTC
    wbtcContract = await ethers.getContractAt("IERC20", WBTC_ADDRESS);
    const Swap = await ethers.getContractFactory("TestUniswap");
    const swapContract = await Swap.deploy();
    return { swapContract, daiWhaleSigner, daiContract, wbtcContract };
  }

  describe("Swap", function () {
    it("Should swap 100 DAI for WBTC", async function () {
      const { swapContract, daiWhaleSigner, daiContract, wbtcContract } = await loadFixture(testSwapUniswap);
      const tokenIn = daiContract.address;
      console.log("tokenIn:",tokenIn);
      const tokenOut = WBTC_ADDRESS;
      //No of dai tokens to be transferred from the whale
      const amountIn = ethers.utils.parseUnits("118", 18);
      console.log("amountIn in DAI:", amountIn);

      const amountOut = "1";
      const to = daiWhaleSigner.address;

      //check that WBTC balance is 0
      const WBTC_BALANCEOF_BEFORE = await wbtcContract.balanceOf(daiWhaleSigner.address);
      console.log("Balance before Swap : ",WBTC_BALANCEOF_BEFORE);
      expect(WBTC_BALANCEOF_BEFORE).to.equal(0);

      //approve DAI
      const approveTx = await daiContract.connect(daiWhaleSigner).approve(swapContract.address, amountIn);
      await approveTx.wait();
      //swap DAI for WBTC
      const swapTx = await swapContract.connect(daiWhaleSigner).swap(tokenIn, tokenOut, amountIn, amountOut, to);
      await swapTx.wait();

      //check WBTC balance > 1
      const WBTC_BALANCEOF_AFTER = await wbtcContract.balanceOf(daiWhaleSigner.address);
      console.log("Balance after Swap : ",WBTC_BALANCEOF_AFTER);
      expect(WBTC_BALANCEOF_AFTER).to.be.greaterThan(WBTC_BALANCEOF_BEFORE);
    });
  });
});
