// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract GiftCard is ERC721URIStorage {
    uint256 public tokenId;

    event minted(uint256);

    constructor() ERC721("GiftCard", "GCA") {}

    function mint(address to, string memory tokenURI) external payable {
        tokenId += 1;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        emit minted(tokenId);
    }

    function nextId() external view returns(uint256) {
        return tokenId;
    }

    function gift(address to) external {
        this.safeTransferFrom(msg.sender, to, tokenId);
    }
}