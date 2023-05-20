// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract GiftCard is ERC721URIStorage {
    uint256 public tokenId;

    constructor() ERC721("GiftCard", "GCA") {}

    function mint(address to, string memory tokenURI) external {
        tokenId += 1;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }

    function nextId() external view returns(uint256) {
        return tokenId;
    }
}