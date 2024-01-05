const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { network, ethers } = require("hardhat");
const { expect } = require("chai");

const { WBTC, WBTC_WHALE, CWBTC, DAI_ADDRESS: DAI, CDAI ,DAI_WHALE: REPAY_WHALE} = require("./config")
const DEPOSIT_AMOUNT = ethers.utils.parseUnits("1", 8);
const SUPPLY_DECIMALS = 8;
const BORROW_DECIMALS = 18;
const BORROW_INTEREST = ethers.utils.parseUnits("1000", 18);

describe("TestCompoundErc20", function () {
  let compoundErc20Contract, signer, repayWhaleSigner, wbtcContract, cToken, tokenToBorrow, ctokenToBorrow;
  async function testCompoundErc20() {
    //impersonate account parameters
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [WBTC_WHALE],
    });

    //instance of signer
    signer = await ethers.getSigner(WBTC_WHALE);

    //instaces of WBTC, CWTC
    wbtcContract = await ethers.getContractAt("IERC20", WBTC);
    cToken = await ethers.getContractAt("IERC20", CWBTC);

    const Flash = await ethers.getContractFactory("TestCompoundErc20");
    compoundErc20Contract = await Flash.deploy(WBTC, CWBTC);
    console.log("WBTC:", WBTC);
    console.log("CWBTC:", CWBTC);

    return { compoundErc20Contract, signer, wbtcContract, cToken };
  }

  async function testCompoundErc20Borrow() {
    //impersonate account parameters
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [WBTC_WHALE],
    });

    //instance of signer
    signer = await ethers.getSigner(WBTC_WHALE);
    //instance of repay whale signer
    repayWhaleSigner = await ethers.getSigner(REPAY_WHALE);// used to repay interest on borrow

    //instances of ERC20 contracts
    wbtcContract = await ethers.getContractAt("IERC20", WBTC);
    cToken = await ethers.getContractAt("IERC20", CWBTC);
    tokenToBorrow = await ethers.getContractAt("IERC20", DAI);
    ctokenToBorrow = await ethers.getContractAt("IERC20", CDAI);

    const testCompound = await ethers.getContractFactory("TestCompoundErc20");
    compoundErc20Contract = await testCompound.deploy(WBTC, CWBTC);

    const supplyBal = await wbtcContract.balanceOf(WBTC_WHALE)
    console.log(`suuply whale balance: ${supplyBal.div(ethers.utils.parseUnits("1",SUPPLY_DECIMALS))}`)
    //assert(supplyBal.gte(DEPOSIT_AMOUNT), "bal < supply")
    expect(supplyBal).to.be.greaterThanOrEqual(DEPOSIT_AMOUNT);//mostly zero

    const borrowBal = await tokenToBorrow.balanceOf(REPAY_WHALE)
    console.log(`repay whale balance: ${borrowBal.div(ethers.utils.parseUnits("1",BORROW_DECIMALS))}`)
    //assert(borrowBal.gte(BORROW_INTEREST), "bal < borrow interest")
    expect(borrowBal).to.be.greaterThanOrEqual(BORROW_INTEREST)

    return { compoundErc20Contract, signer, wbtcContract, cToken, tokenToBorrow, repayWhaleSigner, ctokenToBorrow};
  }
  
  const snapshot = async (testCompound, token, cToken) => {
    const { exchangeRate, supplyRate } = await testCompound.callStatic.getInfo();
    let estimateBalance = await testCompound.callStatic.balanceOfUnderlying();
    let balanceOfUnderlying = await testCompound.callStatic.estimateBalanceOfUnderlying();
    return {
      exchangeRate,
      supplyRate,
      estimateBalance: estimateBalance.toString(),
      balanceOfUnderlying: balanceOfUnderlying.toString(),
      token: await token.balanceOf(testCompound.address),
      cToken: await cToken.balanceOf(testCompound.address),
    }
  }

  describe("Compound ", function () {
    it("Supply and Redeem", async function () {
      const { compoundErc20Contract, signer, wbtcContract, cToken } = await loadFixture(testCompoundErc20);
      console.log("Before balance" , await wbtcContract.balanceOf(signer.address));
      console.log("Before balance of contract" , await wbtcContract.balanceOf(compoundErc20Contract.address));
      console.log("compoundErc20Contract.address = ", compoundErc20Contract.address);
      console.log("DEPOSIT_AMOUNT:" , DEPOSIT_AMOUNT);
      await wbtcContract.connect(signer).approve(compoundErc20Contract.address, DEPOSIT_AMOUNT );
      const testAllowance = await wbtcContract.allowance(signer.address, compoundErc20Contract.address);
      console.log("testAllowance: ", testAllowance);
      let tx = await compoundErc20Contract.connect(signer).supply(DEPOSIT_AMOUNT);
      let after = await snapshot(compoundErc20Contract, wbtcContract, cToken);

      console.log("--- supply ---");
      console.log(`exchange rate ${after.exchangeRate}`);
      console.log(`supply rate ${after.supplyRate}`);
      console.log(`estimate balance ${after.estimateBalance}`);
      console.log(`balance of underlying ${after.balanceOfUnderlying}`);
      console.log(`token balance ${after.token}`);
      console.log(`c token balance ${after.cToken}`);

      // Get the current block number
      let currentBlockNumber = await ethers.provider.getBlockNumber();
      console.log("Current block number:", currentBlockNumber);

      // Set the target block number
      const targetBlockNumber = currentBlockNumber + 10000;
      //accure interest on supply
      // Mine multiple blocks at once
      for (let i = currentBlockNumber; i < targetBlockNumber; i++) {
        await network.provider.send("evm_mine");
      }

      console.log("New block number:", await ethers.provider.getBlockNumber());

      after = await snapshot(compoundErc20Contract, wbtcContract, cToken);
  
      console.log(`--- after some blocks... ---`);
      console.log(`balance of underlying ${after.balanceOfUnderlying}`);
  
      // test redeem
      const cTokenAmount = await cToken.balanceOf(compoundErc20Contract.address);
      tx = await compoundErc20Contract.connect(signer).redeem(cTokenAmount);
  
      after = await snapshot(compoundErc20Contract, wbtcContract, cToken);
  
      console.log(`--- redeem ---`);
      console.log(`balance of underlying ${after.balanceOfUnderlying}`);
      console.log(`token balance ${after.token}`);
      console.log(`c token balance ${after.cToken}`);
      
    });
  });

  const snapshotBorrow = async (testCompound, tokenToBorrow) => {
    const { liquidity } = await testCompound.getAccountLiquidity()
    const colFactor = await testCompound.getCollateralFactor()
    const supplied = await testCompound.callStatic.balanceOfUnderlying()
    const price = await testCompound.getPriceFeed(CDAI)
    const maxBorrow = liquidity.div(price)
    const borrowedBalance = await testCompound.callStatic.getBorrowedBalance(CDAI)
    const tokenToBorrowBal = await tokenToBorrow.balanceOf(testCompound.address)
    const borrowRate = await testCompound.callStatic.getBorrowRatePerBlock(CDAI)

    return {
      colFactor: colFactor.div(ethers.utils.parseUnits("1", 18 - 2)) / 100,
      supplied: supplied.div(ethers.utils.parseUnits("1", SUPPLY_DECIMALS - 2)) / 100,
      price: price.div(ethers.utils.parseUnits("1", 18 - 2)) / 100,
      liquidity: liquidity.div(ethers.utils.parseUnits("1", 18)),
      maxBorrow,
      borrowedBalance: borrowedBalance.div(ethers.utils.parseUnits("1", BORROW_DECIMALS - 2)) / 100,
      tokenToBorrowBal: tokenToBorrowBal.div(ethers.utils.parseUnits("1", BORROW_DECIMALS - 2)) / 100,
      borrowRate,
    }
  }

  describe("Compound ", function () {
    it("Supply , borrow, repay and Redeem", async function () {
      const { compoundErc20Contract, signer, wbtcContract, tokenToBorrow, repayWhaleSigner } = await loadFixture(testCompoundErc20Borrow);
      console.log("compoundErc20Contract.address = ", compoundErc20Contract.address);
      console.log("DEPOSIT_AMOUNT:" , DEPOSIT_AMOUNT);

      //supply
      await wbtcContract.connect(signer).approve(compoundErc20Contract.address, DEPOSIT_AMOUNT );
      const testAllowance = await wbtcContract.allowance(signer.address, compoundErc20Contract.address);
      console.log("testAllowance: ", testAllowance);
      let tx = await compoundErc20Contract.connect(signer).supply(DEPOSIT_AMOUNT);

       // borrow
      console.log("--- borrow (before) ---");
      let snap = await snapshotBorrow(compoundErc20Contract, tokenToBorrow);
      console.log(`col factor: ${snap.colFactor} %`)
      console.log(`supplied: ${snap.supplied}`)
      console.log(`liquidity: $ ${snap.liquidity}`)
      console.log(`price: $ ${snap.price}`)
      console.log(`max borrow: ${snap.maxBorrow}`)
      console.log(`borrowed balance (compound): ${snap.borrowedBalance}`)
      console.log(`borrowed balance (erc20): ${snap.tokenToBorrowBal}`)
      console.log(`borrow rate: ${snap.borrowRate}`)

      tx = await compoundErc20Contract.connect(signer).borrow(CDAI, BORROW_DECIMALS);

      snap = await snapshotBorrow(compoundErc20Contract, tokenToBorrow)
      console.log(`--- borrow (after) ---`)
      console.log(`liquidity: $ ${snap.liquidity}`)
      console.log(`max borrow: ${snap.maxBorrow}`)
      console.log(`borrowed balance (compound): ${snap.borrowedBalance}`)
      console.log(`borrowed balance (erc20): ${snap.tokenToBorrowBal}`)

      //accure interest on Borrow
      let currentBlockNumber = await ethers.provider.getBlockNumber();
      console.log("Current block number:", currentBlockNumber);
        // Set the target block number
      const targetBlockNumber = currentBlockNumber + 10000;
        // Mine multiple blocks at once
      for (let i = currentBlockNumber; i < targetBlockNumber; i++) {
        await network.provider.send("evm_mine");
      }
      console.log("New block number:", await ethers.provider.getBlockNumber());

      
      snap = await snapshotBorrow(compoundErc20Contract, tokenToBorrow)
      console.log(`--- after some blocks... ---`)
      console.log(`liquidity: $ ${snap.liquidity}`)
      console.log(`max borrow: ${snap.maxBorrow}`)
      console.log(`borrowed balance (compound): ${snap.borrowedBalance}`)
      console.log(`borrowed balance (erc20): ${snap.tokenToBorrowBal}`)

      // repay
      console.log("repayWhaleSigner: ", repayWhaleSigner.address)
      console.log("repayWhaleBal   : ", await tokenToBorrow.balanceOf(repayWhaleSigner.address))
      console.log("BORROW_INTEREST : ",BORROW_INTEREST);
      await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [REPAY_WHALE],
      });
      await tokenToBorrow.connect(repayWhaleSigner).transfer(compoundErc20Contract.address, BORROW_INTEREST)
      //max number
      const MAX_UINT = ethers.BigNumber.from(2).pow(256).sub(1);
      tx = await compoundErc20Contract.connect(repayWhaleSigner).repay(DAI, CDAI, MAX_UINT);


      snap = await snapshotBorrow(compoundErc20Contract, tokenToBorrow)
      console.log(`--- repay ---`)
      console.log(`liquidity: $ ${snap.liquidity}`)
      console.log(`max borrow: ${snap.maxBorrow}`)
      console.log(`borrowed balance (compound): ${snap.borrowedBalance}`)
      console.log(`borrowed balance (erc20): ${snap.tokenToBorrowBal}`)
      
    });
  });

});
