const { expect } = require("chai")
const { ethers } = require("hardhat")

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
const WETH9 = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

describe("SwapExamples", () => {
  let swapExamples
  let accounts
  let weth
  let dai
  let usdc

  before(async () => {
    accounts = await ethers.getSigners(1);

    //This is code is for previous hardhat version 2.18.0"
    //const SwapExamples = await ethers.getContractFactory("SwapExamples");

    //this new code is from new hardhat version 2.19.1"
    swapExamples = await ethers.deployContract("SwapExamples");

    weth = await ethers.getContractAt("IWETH", WETH9);
    dai = await ethers.getContractAt("IERC20", DAI);
    usdc = await ethers.getContractAt("IERC20", USDC);
    //note: in previous version we used swapExampleContract.address instead of swapExampleContract.target
    console.log("contract address : ", swapExamples.target);
  })

  //swapExactInputSingle get dai for the amountIN(10 WETH)
  it("swapExactInputSingle", async () => {
    const amountIn = 10n ** 18n
    // Deposit WETH
    await weth.deposit({ value: amountIn });
    console.log("before trade WETH balance : ", await weth.balanceOf(accounts[0].address));
    await weth.approve(swapExamples.target, amountIn);
    // Swap
    await swapExamples.swapExactInputSingle(amountIn);
    console.log("DAI balance", await dai.balanceOf(accounts[0].address));
    console.log("after trade WETH balance : ", await weth.balanceOf(accounts[0].address));
  })

  //swapExactOutputSingle - get 10 DAI and detect the WETH worth of 10 DAI only
  it("swapExactOutputSingle", async () => {
    const wethAmountInMax = 10n ** 18n
    const daiAmountOut = 10n * 10n ** 18n

    // Deposit WETH
    await weth.deposit({ value: wethAmountInMax })
    await weth.approve(swapExamples.target, wethAmountInMax)
    console.log("before trade WETH balance : ", await weth.balanceOf(accounts[0].address));
    // Swap
    await swapExamples.swapExactOutputSingle(daiAmountOut, wethAmountInMax)

    console.log("DAI balance", await dai.balanceOf(accounts[0].address))
    console.log("after trade WETH balance : ", await weth.balanceOf(accounts[0].address));
  })

  //swap WETH --> USDC --> DAI - get dai for the amountIN(10 WETH)
  it("swapExactInputMultihop", async () => {
    const amountIn = 10n ** 18n;

    // Deposit WETH
    await weth.deposit({ value: amountIn });
    await weth.approve(swapExamples.target, amountIn);
    console.log("before trade WETH balance : ", await weth.balanceOf(accounts[0].address));
    // Swap
    await swapExamples.swapExactInputMultihop(amountIn);

    console.log("DAI balance", await dai.balanceOf(accounts[0].address));
    console.log("after trade WETH balance : ", await weth.balanceOf(accounts[0].address));
  })

  //swap WETH --> USDC --> DAI - get 10 DAI and detect the WETH worth of 10 DAI only
  it("swapExactOutputMultihop", async () => {
    const wethAmountInMax = 10n ** 18n;
    const daiAmountOut = 100n * 10n ** 18n;

    // Deposit WETH
    await weth.deposit({ value: wethAmountInMax });
    await weth.approve(swapExamples.target, wethAmountInMax);
    console.log("before trade WETH balance : ", await weth.balanceOf(accounts[0].address));
    // Swap
    await swapExamples.swapExactOutputMultihop(daiAmountOut, wethAmountInMax);

    console.log("DAI balance", await dai.balanceOf(accounts[0].address));
    console.log("after trade WETH balance : ", await weth.balanceOf(accounts[0].address));
  })
})