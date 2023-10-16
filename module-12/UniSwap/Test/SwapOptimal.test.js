const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { network, ethers } = require("hardhat");
//address on mainnet
const { DAI_ADDRESS, WETH_ADDRESS, DAI_WHALE } = require("./config");
describe("Swap", function () {
  let daiContract, daiWhaleSigner, wethContract, pair;
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
    wethContract = await ethers.getContractAt("IERC20", WETH_ADDRESS);
    const optimalSwap = await ethers.getContractFactory("TestUniswapOptimal");
    const optimalSwapContract = await optimalSwap.deploy();
    pair = await ethers.getContractAt("IERC20", await optimalSwapContract.getPair(DAI_ADDRESS, WETH_ADDRESS));
    //No of dai tokens to be transferred from the whale
    const amountIn = ethers.utils.parseUnits("100", 18);
    console.log("amountIn in DAI:", amountIn);
    //approve DAI
    const approveTx = await daiContract.connect(daiWhaleSigner).approve(optimalSwapContract.address, amountIn);
    await approveTx.wait();
    return { optimalSwapContract, daiWhaleSigner, daiContract, wethContract, amountIn };
  }

  const snapshot = async (contract, msg) => {
    const snap =  {
      pair: await pair.balanceOf(contract.address),
      fromToken: await daiContract.balanceOf(contract.address),
      toToken: await wethContract.balanceOf(contract.address),
    };
    console.log(msg)
    console.log("pair", snap.pair.toString())
    console.log("from", snap.fromToken.toString())
    console.log("to", snap.toToken.toString())
    return snap;
  }

  describe("optimal swap", function () {

    it("Fully optimal swap", async () => {
      const { optimalSwapContract, daiWhaleSigner, daiContract, wethContract, amountIn } = await loadFixture(testSwapUniswap);
      await snapshot(optimalSwapContract, "Before :")
      await optimalSwapContract.connect(daiWhaleSigner).zap(daiContract.address, wethContract.address, amountIn, {
        from: DAI_WHALE,
      })
      const snap = await snapshot(optimalSwapContract, "After :")
      expect(snap.fromToken).to.be.lessThan(1);//mostly zero
      /*
      lp 670984579491718872
      from 0
      to 0
      */
    })

    it("sub-optimal swap", async () => {
      const { optimalSwapContract, daiWhaleSigner, daiContract, wethContract, amountIn } = await loadFixture(testSwapUniswap);
      await snapshot(optimalSwapContract, "before")
      await optimalSwapContract.connect(daiWhaleSigner).subOptimalZap(daiContract.address, wethContract.address, amountIn, {
        from: DAI_WHALE,
      })
      const snap = await snapshot(optimalSwapContract, "after")
      expect(snap.fromToken).to.be.greaterThan(0);
      /*
      lp 669981242812980681
      from 149532702389076155
      to 0
      */
     
    })
    });
});
