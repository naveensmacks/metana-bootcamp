const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AdvancedCollectible", function () {
    let AdvancedCollectible, advancedCollectible, owner;
    let deployedAddress = "0xDFcaC9F177F78a699e5879568762f339D3c796AE";

    beforeEach(async function () {
        AdvancedCollectible = await ethers.getContractFactory("AdvancedCollectible");
        [owner] = await ethers.getSigners();

        // get deployed AdvancedCollectible contract
        advancedCollectible = await AdvancedCollectible.attach(deployedAddress);
    });

    it("Should create an advanced collectible", async function () {

        //dai = await ethers.getContractAt("IERC20", DAI);
        //event ReturnedCollectible(uint256 indexed newItemId, Breed breed, uint256 randomNumber);
        // Begin listening for any Transfer event
        advancedCollectible.on("ReturnedCollectible", (newItemId, breed, randomNumber, event) => {
            console.log(`newItemId: ${ newItemId } , breed Number: ${ breed }, randomNumber from vrf: ${ randomNumber }`);
            
            // The `event.log` has the entire EventLog
            console.log("Event.log : ", event.log.args);
  
            // Optionally, stop listening
          });
        // Act - request to create a collectible
        const createTx = await advancedCollectible.createCollectible("None");
        await createTx.wait();

        // Wait for the VRF Coordinator to respond
        // This may require a significant wait time depending on network conditions
        // Optionally, listen for a specific event if your contract emits one after VRF fulfillment

        // Assert - check if the token counter is incremented
        const tokenCounter = await advancedCollectible.tokenCounter();
        expect(tokenCounter).to.be.above(0);

        //listen to emit event  event ReturnedCollectible(uint256 indexed newItemId, Breed breed, uint256 randomNumber);

    });
});
