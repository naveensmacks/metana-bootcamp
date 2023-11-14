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
    let estimateBalance = await testCompound.balanceOfUnderlying.call({ gasLimit: 1000000 });
    console.log("estimateBalance0 : ", estimateBalance);
    let receipt1 = await estimateBalance.wait();
    console.log("estimateBalance : ", receipt1.events[0].data);
    // Convert the hex string to a BigNumber and then to a number
    //const returnValueNumber = ethers.BigNumber.from(receipt1.events[0].data).toNumber();
    console.log("returnValueNumber : ", returnValueNumber);
    let balanceOfUnderlying = await testCompound.estimateBalanceOfUnderlying.call({ gasLimit: 1000000 });
    let receipt2 = await balanceOfUnderlying.wait();
    console.log("balanceOfUnderlying : ", receipt2.events[0].data);
    return {
      exchangeRate,
      supplyRate,
      estimateBalance: estimateBalance.value,
      balanceOfUnderlying: balanceOfUnderlying.value,
      token: await token.balanceOf(testCompound.address),
      cToken: await cToken.balanceOf(testCompound.address),
    }
  }

  describe("Compound ", function () {
    it("Supply and Redeem", async function () {
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
      console.log(`estimate balance ${after.estimateBalance.toString()}`);
      console.log(`balance of underlying ${after.balanceOfUnderlying.toString()}`);
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

      console.log("After increase block number:", await ethers.provider.getBlockNumber());

      after = await snapshot(compoundErc20Contract, wbtcContract, cToken);
  
      console.log(`--- after some blocks... ---`);
      console.log(`balance of underlying ${after.balanceOfUnderlying.toString()}`);
  
      // test redeem
      const cTokenAmount = await cToken.balanceOf(compoundErc20Contract.address);
      tx = await compoundErc20Contract.connect(signer).redeem(cTokenAmount);
  
      after = await snapshot(compoundErc20Contract, wbtcContract, cToken);
  
      console.log(`--- redeem ---`);
      console.log(`balance of underlying ${after.balanceOfUnderlying.toString()}`);
      console.log(`token balance ${after.token}`);
      console.log(`c token balance ${after.cToken}`);


      //await wbtcContract.connect(signer).transfer(testCompoundErc20.address, fundAmount);
      //console.log("After Balance" , await wbtcContract.balanceOf(signer.address));


      /* const receipt = await tx.wait();
    
      //filtering logs only for the TestAaveFlashLoan address
      const logsForContract = receipt.logs.filter((log) => log.address === testCompoundErc20.address);

      const LogEvent = new ethers.utils.Interface(["event Log(string message, uint val)"]);
      console.log("Below are the Log events from the contract");
      for (const log of logsForContract) {
        //filtering only log events - not required the TestAaveFlashLoan contract only has one event which is log
        if (log.topics[0] === ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Log(string,uint256)"))) {
          //or you can also pass LogEvent.getEvent("Log") instead of "Log"
          const decodedLog =  LogEvent.decodeEventLog("Log", log.data, log.topics);
          const message = decodedLog.message;
          const val = decodedLog.val.toString();
          console.log(message, " ", val);
        }
      } */
    });

    it.only("Supply and Redeem", async function () {
      const { compoundErc20Contract, signer, wbtcContract, cToken } = await loadFixture(testCompoundErc20);

      //let estimateBalance = await testCompound.testNonView.call({ gasLimit: 1000000 });
      let test = await compoundErc20Contract.callStatic.testNonView();
      console.log("test : ", test);
      // let receipt = await test.wait();
      // console.log("test receipt : ", receipt);
      // Convert the hex string to a BigNumber and then to a number
      //const returnValueNumber = ethers.BigNumber.from(receipt1.events[0].data).toNumber();
      //console.log("returnValueNumber : ", returnValueNumber);
    });
  });
});
