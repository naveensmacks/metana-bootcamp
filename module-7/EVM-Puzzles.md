############
# Puzzle 1#
############  

00      34      CALLVALUE  
01      56      JUMP  
02      FD      REVERT  
03      FD      REVERT  
04      FD      REVERT  
05      FD      REVERT  
06      FD      REVERT  
07      FD      REVERT  
08      5B      JUMPDEST  
09      00      STOP  
  
Answer:  
8, CALLVALUE pushes 8 to the stack. JUMP to the 8th row skipping all the reverts  
  
  
############
# Puzzle 2 #
############  
00      34      CALLVALUE  
01      38      CODESIZE  
02      03      SUB  
03      56      JUMP  
04      FD      REVERT   
05      FD      REVERT  
06      5B      JUMPDEST  
07      00      STOP  
08      FD      REVERT  
09      FD      REVERT  
  
Answer:  
4, CALLVALUE pushes 4 to the stack and CODESIZE pushes code size to the stack which is 0a(hexa representation of no of steps where each step is  1 byte) and SUB subracts top two elements in stack which is 0a-4(10-4 =6). JUMP to 6 skipping REVERT  

############
# Puzzle 3 #
############  
00      36      CALLDATASIZE  
01      56      JUMP  
02      FD      REVERT  
03      FD      REVERT  
04      5B      JUMPDEST  
05      00      STOP  
  
Answer:  
0xffffffff (hexa rep of 2**32)  
CALLDATASIZE pushes the Get size of input data which is 4 bytes (note 1 byte is 0xff). JUMP to 4th step.  


############
# Puzzle 4 #
############  

00      34      CALLVALUE  
01      38      CODESIZE  
02      18      XOR  
03      56      JUMP  
04      FD      REVERT  
05      FD      REVERT  
06      FD      REVERT  
07      FD      REVERT  
08      FD      REVERT  
09      FD      REVERT  
0A      5B      JUMPDEST  
0B      00      STOP  
  
  
Answer:  
6  
CALLVALUE pushes 6 to the stack and CODESIZE pushes 0C(code size 12 bytes) to the stack. XOR of 6(0110) and 0C(1100) is 0A(1010). JUMP to 0A  


############
# Puzzle 5 #
############  

00      34          CALLVALUE  
01      80          DUP1  
02      02          MUL  
03      610100      PUSH2 0100  
06      14          EQ  
07      600C        PUSH1 0C  
09      57          JUMPI  
0A      FD          REVERT  
0B      FD          REVERT  
0C      5B          JUMPDEST  
0D      00          STOP  
0E      FD          REVERT  
0F      FD          REVERT  

Answer:  
16  
CALLVALUE pushes 16 to stack and DUP1 duplicates top of stack which is 16 . MUL multiplies top two elements which equals to 256 and pops those two elements and pushes the result which is 256. PUSH2 0100 pushes 256 to stack. Now EQ compares top two elements is stack and pops those elements and replaces with the result 1(256==256). PUSH1 0c pushes 0C to the stack. JUMPI Conditonally jumps to 1st element value0C if the before element is not Zero(in our case it will be one)  

############
# Puzzle 6 #
############  

00      6000      PUSH1 00  
02      35        CALLDATALOAD  
03      56        JUMP  
04      FD        REVERT  
05      FD        REVERT  
06      FD        REVERT  
07      FD        REVERT  
08      FD        REVERT  
09      FD        REVERT  
0A      5B        JUMPDEST  
0B      00        STOP  

Answer:  
0x000000000000000000000000000000000000000000000000000000000000000a  
CALLDATALOAD Get input data of current environment. It expects an integer at the top of the stack to know what byte to start loading the calldata from. There is PUSH1 00 followed by CALLDATALOAD meaning that the calldata will be loaded in starting from byte 0 and bytes 0-32 of the calldata will be pushed onto the top of the stack. 0x0a doesnt work, because when calldata is sent, since the byte sequence was not 32 bytes, it is padded to the right, so what we thought was 0a, actually turns into a00000000000000000000000000000000000000000000000000000000000000. So what we need to do is pad our 0x0a with 31 bytes to the left making it 0x000000000000000000000000000000000000000000000000000000000000000a  

############
# Puzzle 7 #
############  

00      36        CALLDATASIZE  
01      6000      PUSH1 00  
03      80        DUP1  
04      37        CALLDATACOPY  
05      36        CALLDATASIZE  
06      6000      PUSH1 00  
08      6000      PUSH1 00  
0A      F0        CREATE  
0B      3B        EXTCODESIZE  
0C      6001      PUSH1 01  
0E      14        EQ  
0F      6013      PUSH1 13  
11      57        JUMPI  
12      FD        REVERT  
13      5B        JUMPDEST  
14      00        STOP  

Answer:  
0x60016000526001601ff3  

EXTCODESIZE evaluates the size of the return value from the deployed bytecode.we should pass in calldata such that when it is deployed, it returns a 1 byte value.Now decoding 0x60016000526001601ff3  
[01] 	PUSH1	01  
[02]	PUSH1	00  
[04]	MSTORE	  
[05]	PUSH1	01  
[07]	PUSH1	1f  
[09]	RETURN	  
https://www.evm.codes/playground?fork=merge&unit=Wei&codeType=Bytecode&code='60016000526001601ff3'_  


############
# Puzzle 8 #
############  

00      36        CALLDATASIZE  
01      6000      PUSH1 00  
03      80        DUP1  
04      37        CALLDATACOPY  
05      36        CALLDATASIZE  
06      6000      PUSH1 00  
08      6000      PUSH1 00  
0A      F0        CREATE  
0B      6000      PUSH1 00  
0D      80        DUP1  
0E      80        DUP1  
0F      80        DUP1  
10      80        DUP1  
11      94        SWAP5  
12      5A        GAS  
13      F1        CALL  
14      6000      PUSH1 00  
16      14        EQ  
17      601B      PUSH1 1B  
19      57        JUMPI  
1A      FD        REVERT  
1B      5B        JUMPDEST  
1C      00        STOP  

? Enter the calldata:   

Answer:0x60036000526001601ff3 (https://www.evm.codes/playground?fork=merge&unit=Wei&codeType=Bytecode&code='60036000526001601ff3'_)  
CALL instruction needs to return 0 which means we need to enter calldata that causes CALL to fail. Since the return value of the above bytecode sequence is 03, the newly created contract's code will be 03 ie. the SUB instruction. So when you call this contract, it will execute the SUB instruction, and since there are no values on the stack in the subcontext of the contract, the CALL will fail & REVERT.  

############  
# Puzzle 9 #
############  

00      36        CALLDATASIZE  
01      6003      PUSH1 03  
03      10        LT  
04      6009      PUSH1 09  
06      57        JUMPI  
07      FD        REVERT  
08      FD        REVERT  
09      5B        JUMPDEST  
0A      34        CALLVALUE  
0B      36        CALLDATASIZE  
0C      02        MUL  
0D      6008      PUSH1 08  
0F      14        EQ  
10      6014      PUSH1 14  
12      57        JUMPI  
13      FD        REVERT  
14      5B        JUMPDEST  
15      00        STOP  
  
Answer:  
? Enter the value to send: 1  
? Enter the calldata: 0x0000000000000001  

Enter calldata such that the CALLDATASIZE is greater than 3 bytes, and the product of CALLDATASIZE * CALLVALUE is 08.  

#############
# Puzzle 10 #
#############  

00      38          CODESIZE  
01      34          CALLVALUE  
02      90          SWAP1  
03      11          GT  
04      6008        PUSH1 08  
06      57          JUMPI  
07      FD          REVERT  
08      5B          JUMPDEST  
09      36          CALLDATASIZE  
0A      610003      PUSH2 0003  
0D      90          SWAP1  
0E      06          MOD  
0F      15          ISZERO  
10      34          CALLVALUE  
11      600A        PUSH1 0A  
13      01          ADD  
14      57          JUMPI  
15      FD          REVERT  
16      FD          REVERT  
17      FD          REVERT  
18      FD          REVERT  
19      5B          JUMPDEST  
1A      00          STOP  

Answer:  
? Enter the value to send: 15  
? Enter the calldata: 0x000001  

Entered call value should be lesser than the CODESIZE(1B) and Calldata should be divisible by three so MOD of 3 yeilds 0. Call value when added with 10(0A) should result in 25(19), hence value of callvalue is 15(0x0f)  

