# Module 8  
## Questions:
### Should you be using pausable or nonReentrant in your NFT? Why or why not?  

Combining both modifiers(pausable and nonReentrant) can give you a more robust and secure NFT contract I guess.

By using pausable, we can pause and resume the functionality of the contract as needed, which is useful during upgrades, maintenance, or to address security vulnerabilities.

By using nonReentrant, we can prevent reentrancy attacks, which occur when a function is called again before the first call has been completed, potentially leading to unintended behavior and security vulnerabilities.

### What trick does OpenZeppelin use to save gas on the nonReentrant modifier?  

To save gas, OpenZeppelin implements the nonReentrant modifier using a single uint256 variable called _status. Instead of using a boolean flag.

The problem with the boolean flag is that the boolean value false is stored in contract storage as 0. Changing storage cell content from 0 to non-zero costs 20k gas and it will happen on each invocation of nonReentrant modifier, because at the end of each invocation cell content is changed back to zero. As a result, each call to nonReentrant costs 25k gas: 20k for writing to zeroed storage cell and 5k for writing to non-zero storage cell.

So by using only the non zero constants(1-NOT_ENTERED,2-ENTERED) it saved nearly 15k gas.
