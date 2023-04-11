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


