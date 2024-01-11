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
        //setting timeouit for mocha test, the test exceeding Mocha's default timeout limit.(2 or 4secs)
        //since we're waiting for an external response from the Chainlink VRF coordinator, the operation takes longer than the default timeout.
        this.timeout(200000); 
        //listen to emit event  event ReturnedCollectible(uint256 indexed newItemId, Breed breed, uint256 randomNumber);
        advancedCollectible.on("ReturnedCollectible", async (newItemId, breed, randomNumber, event) => {
            console.log("event");
            console.log(`newItemId: ${ newItemId } , breed Number: ${ breed }, randomNumber from vrf: ${ randomNumber }`);
            
            // The `event.log` has the entire EventLog
            console.log("Event.log : ", event.log.args);
            
            const tokenCounter = await advancedCollectible.tokenCounter();
            console.log("tc: ", tokenCounter);
            // Assert - check if the token counter is incremented
            expect(tokenCounter).to.be.above(0);
            // Optionally, stop listening
          });
        // Act - request to create a collectible
        console.log(3)
        const createTx = await advancedCollectible.createCollectible("None 2");
        console.log(4)
        await createTx.wait();
       
        // Wait for the VRF Coordinator to respond
        // This may require a significant wait time depending on network conditions
        await new Promise(res => setTimeout(res, 150000));

    });

    it.skip("check tokenCounter after createCollectible", async function () {
        const tokenCounter = await advancedCollectible.tokenCounter();
        console.log("tc: ", tokenCounter);
        // Assert - check if the token counter is incremented
        expect(tokenCounter).to.be.above(0);
    });

});
