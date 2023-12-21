# Lazy Minting NFT
## Contract
Developed a smart contract inheriting from ERC721, ERC721URIStorage, Ownable, and EIP712 contracts.
• Implemented a mapping of trusted signers and a struct representing an NFTicket to ensure that only trusted signers can sign an NFTicket, but anyone with a valid signature from a trusted signer can mint the NFTicket.
• Verified the signer of an NFTicket using EIP712, ensuring the security and authenticity of the NFTickets.
• Enabled the owner to add or remove trusted signers as necessary.
• Defined a function in the script to create an NFTicket and generate its signature using the signer and EIP712, enabling users to securely generate and verify NFTickets.

## Script:
Defines constants for the signer, domain name, version, chain ID, and contract address. Defines a function to create an NFTicket and generate its signature using the signer and EIP712. Defines a function to call createNFTicket and sell an NFTicket.
