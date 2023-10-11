const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { network, ethers } = require("hardhat");

//address on mainnet
const { DAI_ADDRESS, USDC_ADDRESS, DAI_WHALE } = require("./config");

describe("Swap", function () {
  let daiContract, daiWhaleSigner, usdcContract;
  async function testSwapUniswap() {
    //impersonate account parameters
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE],
    });

    //instance of signer
    daiWhaleSigner = await ethers.getSigner(DAI_WHALE);

    //instace of DAI
    daiContract = await ethers.getContractAt("IERC20", DAI_ADDRESS);

    //instace of USDC
    usdcContract = await ethers.getContractAt("IERC20", USDC_ADDRESS);

    const AddLiquidity = await ethers.getContractFactory("TestUniswapLiquidity");
    const addLiquidityContract = await AddLiquidity.deploy();

    return { addLiquidityContract, daiWhaleSigner, daiContract, usdcContract };
  }

  describe("Add liquidity", function () {
    it.only("Should add 100DAI & 100 USDC", async function () {
      const { addLiquidityContract, daiWhaleSigner, daiContract, usdcContract } = await loadFixture(testSwapUniswap);
      const tokenA = daiContract.address;
      const tokenB = usdcContract.address;
      const amountA = await daiContract.balanceOf(daiWhaleSigner.address);
      const amountB = await usdcContract.balanceOf(daiWhaleSigner.address);
      console.log(amountA, amountB);

      //1 approve tokens to add liquidity contract
      const approve1 = await daiContract.connect(daiWhaleSigner).approve(addLiquidityContract.address, amountA);
      const approve2 = await usdcContract.connect(daiWhaleSigner).approve(addLiquidityContract.address, amountB);
      await approve1.wait();
      await approve2.wait();

      //2 call add liquidity contract
      const addLiquidityTx = await addLiquidityContract.connect(daiWhaleSigner).addLiquidity(tokenA, tokenB, amountA, amountB);
      const receiptTx = await addLiquidityTx.wait();
      const events = receiptTx.events;
      console.log(events[9].args);
      console.log(events[10].args);
      console.log(events[11].args);
    });
  });
});
