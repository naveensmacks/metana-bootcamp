const { expect } = require("chai");
const { ethers } = require("hardhat");
const { vrfCoordinatorAddress, linkTokenAddress, keyhash, subscriptionId, fee } = require("../config");

describe("TicketingApp", function () {
  let ticketingApp, deployer;
  let deployedAddress = "0x1B66B137265b20D153B9Ca6037fCE6271FDFb7eb";

  before(async function () {
    const TicketingApp = await ethers.getContractFactory("TicketingApp");
    [deployer] = await ethers.getSigners();

    // get deployed AdvancedCollectible contract
    ticketingApp = await TicketingApp.attach(deployedAddress);
  });

  it.only("Allows users to register", async function () {
    // Simulate user registrations
    for (let i = 0; i < 10; i++) {
      const randomAddress = ethers.hexlify(ethers.randomBytes(20));
      await ticketingApp.connect(deployer).register(randomAddress);
    }

  });

  it("show registrants", async function () {
    console.log("Registered Participants")
    let max_participants = await ticketingApp.MAX_PARTICIPANTS();
    for(let i = 0 ; i< max_participants; i++) {
      console.log(await ticketingApp.registrants(i));
    }
  });
  //Run this after the stipulated time
  it("Draws winners after registration period", async function () {
    
    // Draw winners
    await ticketingApp.drawWinners();

    // Verify winners are drawn - this part is tricky due to the async nature of VRF
    // You may need to wait for the VRF callback to be fulfilled in a real test environment
    // For simplicity, we assume here that the callback is fulfilled instantly, which won't be the case
    // A more complex test setup would be required to simulate or wait for the VRF callback
  });

  it("show selected winners", async function () {
    console.log("Selected Winners")
    let max_winners = await ticketingApp.MAX_WINNERS();
    for(let i = 0 ; i< max_winners; i++) {
      console.log(await ticketingApp.selectedWinners(i));
    }
  });
});
