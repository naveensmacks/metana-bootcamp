const { expect } = require("chai");
const { ethers } = require("hardhat");
const { vrfCoordinatorAddress, linkTokenAddress, keyhash, subscriptionId, fee } = require("../config");

describe("TicketingApp", function () {
  let ticketingApp, deployer, users;

  before(async function () {
    // Get signers
    [deployer, ...users] = await ethers.getSigners();

    // Deploy the TicketingApp contract
    const TicketingApp = await ethers.getContractFactory("TicketingApp");
    ticketingApp = await TicketingApp.deploy(subscriptionId, vrfCoordinatorAddress, keyhash);
    await ticketingApp.deployed();
  });

  it("Allows users to register", async function () {
    // Simulate user registrations
    for (let i = 0; i < 10; i++) {
      await ticketingApp.connect(users[i]).register();
    }

    // Verify registrations
    const registrantCount = await ticketingApp.getRegistrantCount();
    expect(registrantCount).to.equal(10);
  });

  it("Draws winners after registration period", async function () {
    // Increase blockchain time to simulate end of registration period
    await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]); // 2 days
    await ethers.provider.send("evm_mine");

    // Draw winners
    await ticketingApp.drawWinners();

    // Verify winners are drawn - this part is tricky due to the async nature of VRF
    // You may need to wait for the VRF callback to be fulfilled in a real test environment
    // For simplicity, we assume here that the callback is fulfilled instantly, which won't be the case
    // A more complex test setup would be required to simulate or wait for the VRF callback
  });

  it("Correctly selects winners", async function () {
    // Check the selected winners count
    // This part is highly dependent on your contract's public methods to fetch winners or winner count
    // Assuming you have a method to fetch the count of selected winners
    const winnersCount = await ticketingApp.getSelectedWinnersCount();
    expect(winnersCount).to.be.greaterThan(0);
    // This assumes your contract has implemented such a function
  });
});
