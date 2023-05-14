# Module 2 redone

Make the three contracts for the NFT, ERC20 token, and staking contract upgradeable using Openzeppelin upgradability plugin. Deploy it from hardhat.  
Build a new version of the NFT that adds god mode to the NFT (the ability to transfer NFTs between accounts forcefully). Etherscan should show the previous version and the new version

## Commands to deploy & verify proxy & implementation
```shell
npx hardhat run --network sepolia scripts/deployERC20.js    
# result  
# Deploying MyERC20TokenUpgradeable...  
# MyERC20TokenUpgradeable deployed to: 0x049F7AC3e119B2f7275f9514a17e549e56Bda224  
npx hardhat verify --network sepolia 0x049F7AC3e119B2f7275f9514a17e549e56Bda224  
# result  
# Verifying implementation: 0xb38Dd2475aaAb91a26AabbA79CA7F17FeA0F0821  (Implementation contract of ERC20)
# Nothing to compile  
# Successfully submitted source code for contract  
# contracts/MyERC20TokenUpgradeable.sol:MyERC20TokenUpgradeable at 0xb38Dd2475aaAb91a26AabbA79CA7F17FeA0F0821  
# for verification on the block explorer. Waiting for verification result...  

# Successfully verified contract MyERC20TokenUpgradeable on Etherscan.  
# https://sepolia.etherscan.io/address/0xb38Dd2475aaAb91a26AabbA79CA7F17FeA0F0821#code  
# Verifying proxy: 0x049F7AC3e119B2f7275f9514a17e549e56Bda224  
# Contract at 0x049F7AC3e119B2f7275f9514a17e549e56Bda224 already verified.  
# Linking proxy 0x049F7AC3e119B2f7275f9514a17e549e56Bda224 with implementation  
# Successfully linked proxy to implementation.  
# Verifying proxy admin: 0xA57d9f2DA936d12E4Ae60d652aFd13Ad32bD8020  
# Contract at 0xA57d9f2DA936d12E4Ae60d652aFd13Ad32bD8020 already verified.  
  
# Proxy fully verified.    

npx hardhat run --network sepolia scripts/deployERC721.js  
# result  
# Deploying MyERC721TokenUpgradeable...  
# MyERC721TokenUpgradeable deployed to: 0x23d829C6ADc01AF4625348cCa6c2f96670FFcae2 
npx hardhat verify --network sepolia 0x23d829C6ADc01AF4625348cCa6c2f96670FFcae2   
# result
# Verifying implementation: 0x57a8d6b83CB11c67BC15566DC0d7ECf902aEccBD (Implementation of ERC721-V1)
# Nothing to compile
# Successfully submitted source code for contract
# contracts/MyERC721TokenUpgradeable.sol:MyERC721TokenUpgradeable at 0x57a8d6b83CB11c67BC15566DC0d7ECf902aEccBD
# for verification on the block explorer. Waiting for verification result...

# Successfully verified contract MyERC721TokenUpgradeable on Etherscan.
# https://sepolia.etherscan.io/address/0x57a8d6b83CB11c67BC15566DC0d7ECf902aEccBD#code
# Verifying proxy: 0x23d829C6ADc01AF4625348cCa6c2f96670FFcae2
# Contract at 0x23d829C6ADc01AF4625348cCa6c2f96670FFcae2 already verified.
# Linking proxy 0x23d829C6ADc01AF4625348cCa6c2f96670FFcae2 with implementation
# Successfully linked proxy to implementation.
# Verifying proxy admin: 0xA57d9f2DA936d12E4Ae60d652aFd13Ad32bD8020
# Contract at 0xA57d9f2DA936d12E4Ae60d652aFd13Ad32bD8020 already verified.

# Proxy fully verified.

npx hardhat run --network sepolia scripts/deployStaking.js 
# result  
# Deploying MyStakingContractUpgradeable...  
# MyStakingContractUpgradeable deployed to: 0xC119aFD9e85357fA5a2C06EB543963c876d6b97b 
# npx hardhat verify --network sepolia 0xC119aFD9e85357fA5a2C06EB543963c876d6b97b  
# Verifying implementation: 0x3FeDb24cb85ac793cb8e6A958EC0031b8837bbdC (Implementation of StakingContract)
# Nothing to compile
# Successfully submitted source code for contract
# contracts/MyStakingContractUpgradeable.sol:MyStakingContractUpgradeable at 0x3FeDb24cb85ac793cb8e6A958EC0031b8837bbdC
# for verification on the block explorer. Waiting for verification result...

# Successfully verified contract MyStakingContractUpgradeable on Etherscan.
# https://sepolia.etherscan.io/address/0x3FeDb24cb85ac793cb8e6A958EC0031b8837bbdC#code
# Verifying proxy: 0xC119aFD9e85357fA5a2C06EB543963c876d6b97b
# Contract at 0xC119aFD9e85357fA5a2C06EB543963c876d6b97b already verified.
# Linking proxy 0xC119aFD9e85357fA5a2C06EB543963c876d6b97b with implementation
# Successfully linked proxy to implementation.
# Verifying proxy admin: 0xA57d9f2DA936d12E4Ae60d652aFd13Ad32bD8020
# Contract at 0xA57d9f2DA936d12E4Ae60d652aFd13Ad32bD8020 already verified.

# Proxy fully verified.

# Upgrading to V2
npx hardhat run --network sepolia scripts/deployERC721V2.js
# result
# MyNFT upgraded: 0x23d829C6ADc01AF4625348cCa6c2f96670FFcae2
npx hardhat verify --network sepolia 0x23d829C6ADc01AF4625348cCa6c2f96670FFcae2
# result
# Verifying implementation: 0x28933425D1CC11ED778ae10f5bFD8E0E4E4730d7 (Implementation of ERC721-V2)
# Nothing to compile
# Successfully submitted source code for contract
# contracts/MyERC721TokenUpgradeableV2.sol:MyERC721TokenUpgradeableV2 at 0x28933425D1CC11ED778ae10f5bFD8E0E4E4730d7
# for verification on the block explorer. Waiting for verification result...

# Successfully verified contract MyERC721TokenUpgradeableV2 on Etherscan.
# https://sepolia.etherscan.io/address/0x28933425D1CC11ED778ae10f5bFD8E0E4E4730d7#code
# Verifying proxy: 0x23d829C6ADc01AF4625348cCa6c2f96670FFcae2
# Contract at 0x23d829C6ADc01AF4625348cCa6c2f96670FFcae2 already verified.
# Linking proxy 0x23d829C6ADc01AF4625348cCa6c2f96670FFcae2 with implementation
# Successfully linked proxy to implementation.
# Verifying proxy admin: 0xA57d9f2DA936d12E4Ae60d652aFd13Ad32bD8020
# Contract at 0xA57d9f2DA936d12E4Ae60d652aFd13Ad32bD8020 already verified.

# Proxy fully verified.

```
