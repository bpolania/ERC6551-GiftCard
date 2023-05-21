// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./ERC6551Registry.sol";
import "./GiftCardAccount.sol";
import "./interfaces/IERC6551Account.sol";

contract GiftCardExtended is ERC721URIStorage {
    uint256 private _tokenId;
    ERC6551Registry private _registry;
    GiftCardAccount private _accountContract;
    address public accountAddress;

    event minted(uint256);

    constructor() ERC721("GiftCard", "GCA") {
        _registry = new ERC6551Registry();
    }

    function mint(address to, string memory tokenURI) external payable {
        _tokenId += 1;
        _accountContract = new GiftCardAccount();
        uint256 salt = generateRandomSalt();
        bytes memory emptyBytes = "";
        accountAddress = _registry.createAccount(address(_accountContract), block.chainid, address(this), _tokenId, salt, emptyBytes);
        address expectedAddress = _registry.account(address(_accountContract), block.chainid, address(this), _tokenId, salt);
        require(accountAddress == expectedAddress, "wrong addresses");
        _safeMint(to, _tokenId);
        _setTokenURI(_tokenId, tokenURI);
        loadBalance(payable(accountAddress), msg.value);
        emit minted(_tokenId);
    }

    function gift(address to, uint256 tokenId) external {
        this.safeTransferFrom(msg.sender, to, tokenId);
    }
    
    /// Internal Functions

    function nextId() internal view returns(uint256) {
        return _tokenId;
    }

    function generateRandomSalt() internal view returns (uint256) {
        bytes32 hash = keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce()));
        return uint256(hash);
    }

    function nonce() internal pure returns (uint256) {
        return 1;
    }

    function loadBalance(address payable to, uint amount) internal {
        (bool success, ) = to.call{value: amount}("");
        require(success, "Failed to send Ether");
    }
}