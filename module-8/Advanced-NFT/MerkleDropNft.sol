// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/BitMaps.sol";

contract MerkleDropNft is ERC721 {
    bytes32 immutable public root;
    uint256 public totalSupply;

    struct Commit {
	    		bytes32 commit;
	    		//uint64 block;
	    		bool revealed;
	  		 }
	mapping (address => Commit) public commits;

    // Used for random index assignment - p
    mapping(uint256 => uint256) public tokenMatrix;

    // The initial token ID - p
    uint256 public startFrom;

    using Counters for Counters.Counter;

    // Keeps track of how many we have minted - p
    Counters.Counter public tokenCount;

    using BitMaps for BitMaps.BitMap;

    BitMaps.BitMap private claimedStatus;

    event CommitHash(address sender, bytes32 dataHash);
    event RevealHash(address sender, bytes32 revealHash, uint256 random);

    constructor(string memory name, string memory symbol, bytes32 merkleroot,  uint256 _startFrom, uint256 _totalSupply) ERC721(name, symbol){
        root = merkleroot;
        startFrom = _startFrom;
        totalSupply = _totalSupply;
    }

    function commit(address account,uint8 index, bytes32 dataHash,bytes32[] calldata proof) public {
        require(_verify(_leaf(account, index), proof), "Invalid merkle proof");
        commits[msg.sender].commit = dataHash;
        commits[msg.sender].revealed = false;
        emit CommitHash(msg.sender,commits[msg.sender].commit);
    }
  
    function getHash(bytes32 data) public view returns(bytes32){
        return keccak256(abi.encodePacked(address(this), data));
    }

    function _leaf(address account, uint8 index) internal pure returns (bytes32){
        return keccak256(abi.encodePacked(account, index));
    }

    function _verify(bytes32 leaf, bytes32[] memory proof) internal view returns (bool){
        return MerkleProof.verify(proof, root, leaf);
    }

    function reveal(bytes32 revealHash) public {
        //make sure it hasn't been revealed yet and set it to revealed
        require(commits[msg.sender].revealed==false,"CommitReveal::reveal: Already revealed");
        commits[msg.sender].revealed=true;
        //require that they can produce the committed hash
        require(getHash(revealHash)==commits[msg.sender].commit,"CommitReveal::reveal: Revealed hash does not match commit");
        
        // Update the claimedBitMap to mark the user's tokens as claimed
        claimedStatus.set(tokenCount.current());
        
        uint256 randomId = nextToken(revealHash);

        _safeMint(msg.sender, randomId);
        emit RevealHash(msg.sender,revealHash,randomId);
    }

    function nextToken(bytes32 revealHash) internal ensureAvailability returns (uint256) {
        uint256 maxIndex = totalSupply - tokenCount.current();
        uint256 random = uint256(keccak256(
            abi.encodePacked(
                msg.sender,
                revealHash,
                block.timestamp
            )
        )) % maxIndex;

        uint256 value = 0;
        if (tokenMatrix[random] == 0) {
            // If this matrix position is empty, set the value to the generated random number.
            value = random;
        } else {
            // Otherwise, use the previously stored number from the matrix.
            value = tokenMatrix[random];
        }

        // If the last available tokenID is still unused...
        if (tokenMatrix[maxIndex - 1] == 0) {
            // ...store that ID in the current matrix position.
            tokenMatrix[random] = maxIndex - 1;
        } else {
            // ...otherwise copy over the stored number to the current matrix position.
            tokenMatrix[random] = tokenMatrix[maxIndex - 1];
        }

        // Increment counts
        incrementCount();

        return value + startFrom;
    }

    function isClaimed(uint256 index) external view returns (bool) {
        return claimedStatus.get(index);
    }

    /// @dev Increment the token count and fetch the latest count
    /// @return the next token id
    function incrementCount() internal virtual returns (uint256) {
        uint256 token = tokenCount.current();
        tokenCount.increment();
        return token;
    }

    /// @dev Check whether another token is still available
    modifier ensureAvailability() {
        uint256 availableTokenCount = totalSupply - tokenCount.current();
        require(availableTokenCount > 0, "No more tokens available");
        _;
    }

}