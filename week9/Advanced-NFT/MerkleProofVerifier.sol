// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleProofVerifier {
    // The Merkle root of the tree containing the allowed addresses.
    bytes32 public merkleRoot;
    bytes public hash;

    constructor(bytes32 _merkleRoot) {
        merkleRoot = _merkleRoot;
    }

    // Verifies the submitted Merkle proof for the given address using sha256.
    function verifyProof(bytes32[] calldata proof, address userAddress) public view returns (bool) {
        bytes32 leaf = sha256(abi.encodePacked(userAddress));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }

    // Verifies the submitted Merkle proof for the given address using keccak256.
    function verifyProof1(bytes32[] calldata proof, address userAddress) public view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(userAddress));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }

    function verifyProof2(bytes32[] calldata proof, address userAddress, uint8 index) public view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(userAddress,index));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }

    function gethash(address userAddress) public returns (bytes32){
        hash  = abi.encodePacked(userAddress);
        bytes32 leaf = keccak256(abi.encodePacked(userAddress));
        return leaf;
    }
}

//  Test Data

//  0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
//    "proof": ["0x999bf57501565dbd2fdcea36efa2b9aef8340a8901e3459f4a4c926275d36cdb", "0x4726e4102af77216b09ccd94f40daa10531c87c4d60bba7f3b3faf5ff9f19b3c", "0xc7348b15532ca2d26bca10e3d3b985a564813cd9a0f710f7acb7ab94ad00da56", "0xcbc89f7cc8d12d8866dba2ea234a8e53e82ff6a9aba35b93b9647d64c25b14f0"]


//0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2

//"proof": ["0x5931b4ed56ace4c46b68524cb5bcbf4195f1bbaacbe5228fbd090546c88dd229", "0x4726e4102af77216b09ccd94f40daa10531c87c4d60bba7f3b3faf5ff9f19b3c", "0xc7348b15532ca2d26bca10e3d3b985a564813cd9a0f710f7acb7ab94ad00da56", "0xcbc89f7cc8d12d8866dba2ea234a8e53e82ff6a9aba35b93b9647d64c25b14f0"]

//latest proofs
//  0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
//"proof": ["0xbad0b54e420be7a13809050874dc95ab03a0709dbee660c91e7b5b239e2bdc94", "0xc1033627365936f694fc05e36073c51da3b83a97ef382860276448e3049c6685", "0x1acec4b43ff83e24d1847e1d9faec5f85a24e218826d61c13327dd817dde499c", "0x424cbd1ae4810e6424845ecae7c12fbf3b73c63ff30699cc4d0fd30379e5ce87"]
//6th index
//0x17F6AD8Ef982297579C203069C1DbfFE4348c372

//["0x4de09ce15e664172ae1d1d338c6a8e9f00a48de288f82fee723ce84d66b0a480", "0xf8869481e5d989a53a65ca317c3c27b4c7117a8acb87d6b76d5003f062ab6fe3", "0x3ea44bac0526d604822fb6b2a9cc2f7715c987b5110202e8cc35e491705a5ed7", "0x424cbd1ae4810e6424845ecae7c12fbf3b73c63ff30699cc4d0fd30379e5ce87"]