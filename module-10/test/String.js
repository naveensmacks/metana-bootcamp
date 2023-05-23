const { expect } = require("chai");
describe("String", function () {
  async function deploy() {
    const String = await ethers.getContractFactory("String");
    const string = await String.deploy();

    return { string };
  } 

  describe("Deployment", function () {
    it("Test CharAt using (“abcdef”, 2)", async function () {
      const { string } = await deploy();
      expect(await string.charAt('abcdef', 2)).to.equal('0x6300');
    });

    it("Test CharAt using (“”, 0)", async function () {
      const { string } = await deploy();
      expect(await string.charAt('', 0)).to.equal('0x0000');
    });

    it("Test CharAt using (“george”, 10)", async function () {
      const { string } = await deploy();
      expect(await string.charAt('george', 10)).to.equal('0x0000');
    });

    it("Test CharAtAsn using (“abcdef”, 2)", async function () {
      const { string } = await deploy();
      expect(await string.charAtAsm('abcdef', 2)).to.equal('0x63');
    });

    it("Test CharAtAsm using (“”, 0)", async function () {
      const { string } = await deploy();
      expect(await string.charAtAsm('', 0)).to.equal('0x00');
    });

    it("Test CharAtAsm using (“george”, 10)", async function () {
      const { string } = await deploy();
      expect(await string.charAtAsm('george', 10)).to.equal('0x00');
    });
  });
});
