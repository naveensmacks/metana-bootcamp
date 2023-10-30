const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { network, ethers } = require("hardhat");
const { USDC_ADDRESS, DAI_WHALE: USDC_WHALE } = require("./config");
const ADDRESS_PROVIDER = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"


describe("TestAaveFlashLoan", function () {
  let aaveFlashLoanContract, signer, usdcContract;
  async function testAaveFlashLoan() {
    //impersonate account parameters
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [USDC_WHALE],
    });

    //instance of signer
    signer = await ethers.getSigner(USDC_WHALE);

    //instace of USDC
    usdcContract = await ethers.getContractAt("IERC20", USDC_ADDRESS);

    const Flash = await ethers.getContractFactory("TestAaveFlashLoan");
    aaveFlashLoanContract = await Flash.deploy(ADDRESS_PROVIDER);

    return { aaveFlashLoanContract, signer, usdcContract };
  }

  describe("Flash Loan", function () {
    it("Should Flash Loan 1000 USDC", async function () {
      const { aaveFlashLoanContract, signer, usdcContract } = await loadFixture(testAaveFlashLoan);
      const borrrowAmount = ethers.utils.parseUnits("1000", 6);
      const fundAmount = ethers.utils.parseUnits("2000", 6);
      console.log("fundAmount   :", fundAmount);
      console.log("borrrowAmount:",borrrowAmount);
      const USDC_BALANCEOF_BEFORE = await usdcContract.balanceOf(signer.address);
      console.log("Balance before Loan : ",USDC_BALANCEOF_BEFORE);

      await usdcContract.connect(signer).transfer(aaveFlashLoanContract.address, fundAmount);

      const tx = await aaveFlashLoanContract.testFlashLoan(usdcContract.address, borrrowAmount);
      const receipt = await tx.wait();
    
      //filtering logs only for the TestAaveFlashLoan address
      const logsForContract = receipt.logs.filter((log) => log.address === aaveFlashLoanContract.address);

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
      }
    });
  });
});
// fundAmount   : BigNumber { value: "2000000000" }
// borrrowAmount: BigNumber { value: "1000000000" }
// Balance before Loan :  BigNumber { value: "30946995161" }
// Below are the Log events from the contract
// balance before loan   2000000000
// balance after loan    3000000000
// borrowed   1000000000
// fee   900000