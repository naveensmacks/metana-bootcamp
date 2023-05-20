const { expect } = require("chai");
describe("String", function () {
  async function deploy() {
    const String = await ethers.getContractFactory("String");
    const string = await String.deploy();

    return { bitWise };
  } 

  describe("Deployment", function () {
    
  });
});
