// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@0xsequence/sstore2/contracts/utils/Bytecode.sol";

import "./interfaces/IERC6551Account.sol";
import "./libs/ERC6551AccountLib.sol";

contract GiftCardAccount is IERC165, IERC1271, IERC6551Account {
    uint256 public nonce;

    receive() external payable {}

    function executeCall(
        address to,
        uint256 value,
        bytes calldata data
    ) external payable returns (bytes memory result) {
        require(msg.sender == owner(), "Not token owner");

        ++nonce;

        emit TransactionExecuted(to, value, data);

        bool success;
        (success, result) = to.call{value: value}(data);

        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    function token()
        external
        view
        returns (
            uint256,
            address,
            uint256
        )
    {
        uint256 length = address(this).code.length;
        return
        abi.decode(
                Bytecode.codeAt(address(this), length - 0x60, length),
                (uint256, address, uint256)
            );
    }

    function owner() public view returns (address) {
        (uint256 chainId, address tokenContract, uint256 tokenId) = this.token();
        require(chainId == block.chainid, "Wrong chainID");
        return IERC721(tokenContract).ownerOf(tokenId);
    }

    function gift(address to) public {
        (uint256 chainId, address tokenContract, uint256 tokenId) = this.token();
        IERC721 erc721 = IERC721(tokenContract);
        require(chainId == block.chainid, "Wrong chainID");
        require(msg.sender == erc721.ownerOf(tokenId), "Caller not owner");
        erc721.safeTransferFrom(msg.sender, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return (interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IERC6551Account).interfaceId);
    }

    function isValidSignature(bytes32 hash, bytes memory signature)
        external
        view
        returns (bytes4 magicValue)
    {
        bool isValid = SignatureChecker.isValidSignatureNow(owner(), hash, signature);

        if (isValid) {
            return IERC1271.isValidSignature.selector;
        }

        return "";
    }
}
