# Advanced NFT   

Implement a merkle tree airdrop where addresses in the merkle tree are allowed to mint once. Measure the gas cost of using a mapping to track if an address already minted vs tracking each address with a bit in a bitmap. Hint: the merkle leaf should be the hash of the address and its index in the bitmap. Use the bitmaps from OpenZeppelin
Use commit reveal to allocate NFT ids randomly. The reveal should be 10 blocks ahead of the commit. You can look at cool cats NFT to see how this is done. They use chainlink, but you should use commit-reveal. 

Add multicall to the NFT so people can transfer several NFTs in one transaction (make sure people can’t abuse minting!). 

The NFT should use a state machine to determine if it is mints can happen, the presale is active, or the public sale is active, or the supply has run out. Require statements should only depend on the state (except when checking input validity). 

Designated address should be able to withdraw funds using the pull pattern. You should be able to withdraw to an arbitrary number of contributors. 
