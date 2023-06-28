// SPDX-License-Identifier: MIT

pragma experimental ABIEncoderV2;
pragma solidity ^0.8.0;

contract Verifier {
    uint256 constant chainId = 0;
    address constant verifyingContract = 0x1C56346CD2A2Bf3202F771f50d3D14a367B48070;
    bytes32 constant salt = 0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558;
    
    string private constant EIP712_DOMAIN  = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)";
    string private constant IDENTITY_TYPE = "Identity(uint256 userId,address wallet)";
    string private constant BID_TYPE = "Bid(uint256 amount,Identity bidder)Identity(uint256 userId,address wallet)";
    
    bytes32 private constant EIP712_DOMAIN_TYPEHASH = keccak256(abi.encodePacked(EIP712_DOMAIN));
    bytes32 private constant IDENTITY_TYPEHASH = keccak256(abi.encodePacked(IDENTITY_TYPE));
    bytes32 private constant BID_TYPEHASH = keccak256(abi.encodePacked(BID_TYPE));
    bytes32 private constant DOMAIN_SEPARATOR = keccak256(abi.encode(
        EIP712_DOMAIN_TYPEHASH,
        keccak256("My amazing dApp"),
        keccak256("2"),
        chainId,
        verifyingContract,
        salt
    ));
    
    struct Identity {
        uint256 userId;
        address wallet;
    }
    
    struct Bid {
        uint256 amount;
        Identity bidder;
    }
    
    function hashIdentity(Identity memory identity) private pure returns (bytes32) {
        return keccak256(abi.encode(
            IDENTITY_TYPEHASH,
            identity.userId,
            identity.wallet
        ));
    }
    
    function hashBid(Bid memory bid) private pure returns (bytes32){
        return keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            keccak256(abi.encode(
                BID_TYPEHASH,
                bid.amount,
                hashIdentity(bid.bidder)
            ))
        ));
    }
    
    function verify() public pure returns (bool) {
        Identity memory bidder = Identity({
            userId: 323,
            wallet: 0x3333333333333333333333333333333333333333
        });
        
        Bid memory bid = Bid({
            amount: 100,
            bidder: bidder
        });
            
        bytes32 sigR = 0xbfa9da0696b032eda4cdd7e8add8b1338d5db6c27d28943ef6ecf1097838cd88;
        bytes32 sigS = 0x0173210985aad648e2668b165263601d41827f82dcf9dcee8b80365575b2681e;
        uint8 sigV = 27;

        // NOTE: please convert the signer's address to its checksummed version 
        // in order to compile the code.
        //
        // You can use visit Etherscan and copy-paste the checksummed address
        // to do so.
        //
        // A checksummed address contains a mix of uppercase and lowercase
        // characters.
        //
        // https://etherscan.io/address/0xdee8dbd5ddbcacf2a7c850b6496d18c7f22f5bde
        //address signer = 0xdee8dbd5ddbcacf2a7c850b6496d18c7f22f5bde;
        address signer = 0xDEe8dbD5ddBcAcf2a7C850B6496d18C7F22f5bDe;
    
        return signer == ecrecover(hashBid(bid), sigV, sigR, sigS);
    }
}

//EIP-712 source
//https://medium.com/metamask/eip712-is-coming-what-to-expect-and-how-to-use-it-bb92fd1a7a26
//https://weijiekoh.github.io/eip712-signing-demo/index.html