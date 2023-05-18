const { expect } = require("chai");
describe("BitWise", function () {
  async function deploy() {
    const BitWise = await ethers.getContractFactory("BitWise");
    const bitWise = await BitWise.deploy();

    return { bitWise };
  }

  describe("Deployment", function () {
    it("Using countBitSet", async function () {
      const { bitWise } = await deploy();
      expect(await bitWise.countBitSet(7)).to.equal(3);
    });

    it("Using countBitSetAsm", async function () {
      const { bitWise } = await deploy();
      expect(await bitWise.countBitSetAsm(7)).to.equal(3);
    });

    it("Compare countBitSet with countBitSetAsm", async function () {
      const { bitWise } = await deploy();
      for (i = 0; i < 256; i++) {
        console.log(`Value : ${i}  No. of Bits : ${await bitWise.countBitSetAsm(i)}`);
        expect(await bitWise.countBitSet(i)).to.equal(await bitWise.countBitSetAsm(i));
      }
    });
  });
});
