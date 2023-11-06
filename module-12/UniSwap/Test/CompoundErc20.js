const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { network, ethers } = require("hardhat");

const { WBTC, WBTC_WHALE, CWBTC } = require("./config")
const DEPOSIT_AMOUNT = ethers.utils.parseUnits("1", 8);


describe("TestCompoundErc20", function () {
  let compoundErc20Contract, signer, wbtcContract, cToken;
  async function testCompoundErc20() {
    //impersonate account parameters
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [WBTC_WHALE],
    });

    //instance of signer
    signer = await ethers.getSigner(WBTC_WHALE);

    //instace of USDC
    wbtcContract = await ethers.getContractAt("IERC20", WBTC);
    cToken = await ethers.getContractAt("IERC20", CWBTC);

    const Flash = await ethers.getContractFactory("TestCompoundErc20");
    compoundErc20Contract = await Flash.deploy(WBTC, CWBTC);
    console.log("WBTC:", WBTC);
    console.log("CWBTC:", CWBTC);

    return { compoundErc20Contract, signer, wbtcContract, cToken };
  }
  
  const snapshot = async (testCompound, token, cToken) => {
    const { exchangeRate, supplyRate } = await testCompound.getInfo.call()

    return {
      exchangeRate,
      supplyRate,
      estimateBalance: await testCompound.estimateBalanceOfUnderlying.call(),
      balanceOfUnderlying: await testCompound.balanceOfUnderlying.call(),
      token: await token.balanceOf(testCompound.address),
      cToken: await cToken.balanceOf(testCompound.address),
    }
  }

  describe("Compound ", function () {
    it.only("Supply and Redeem", async function () {
      const { compoundErc20Contract, signer, wbtcContract, cToken } = await loadFixture(testCompoundErc20);
      console.log("Before balance" , await wbtcContract.balanceOf(signer.address));
      console.log("compoundErc20Contract.address = ", compoundErc20Contract.address);
      console.log("DEPOSIT_AMOUNT:" , DEPOSIT_AMOUNT);
      await wbtcContract.connect(signer).approve(compoundErc20Contract.address, DEPOSIT_AMOUNT );
      const testAllowance = await wbtcContract.allowance(signer.address, compoundErc20Contract.address);
      console.log("testAllowance: ", testAllowance);
      console.log("2", signer.address);
      let tx = await compoundErc20Contract.connect(signer).supply(DEPOSIT_AMOUNT);
      console.log("3");
      let after = await snapshot(compoundErc20Contract, wbtcContract, cToken);

      console.log("--- supply ---");
      console.log(`exchange rate ${after.exchangeRate}`);
      console.log(`supply rate ${after.supplyRate}`);
      console.log(`estimate balance ${after.estimateBalance}`);
      console.log(`balance of underlying ${after.balanceOfUnderlying}`);
      console.log(`token balance ${after.token}`);
      console.log(`c token balance ${after.cToken}`);
      // Get the current block number
      const currentBlockNumber = await ethers.provider.getBlockNumber();
      console.log("Current block number:", currentBlockNumber);

      // accrue interest on supply
      // Increase the block number by 500
      await network.provider.send("evm_increaseTime", [500]);
      await network.provider.send("evm_mine", []);
  
      console.log("Current block number:", await ethers.provider.getBlockNumber());
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
});
