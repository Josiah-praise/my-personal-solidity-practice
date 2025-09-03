//SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TickNFT is ERC721, ERC721URIStorage, Ownable{
    uint256 counter;

    constructor(
        string memory _name,
        string memory _symbol,
        address _owner
        ) ERC721(_name, _symbol) Ownable(_owner) {}

    function safeMint(address to, string calldata _tokenURI)external onlyOwner returns(uint256) {
        uint nextIndex = counter++;
        _safeMint(to, nextIndex);
        _setTokenURI(nextIndex, _tokenURI);
        return nextIndex;
    }

    function burn(uint256 _tokenId)external onlyOwner {
        _burn(_tokenId);
    }

    function supportsInterface(bytes4 interfaceId)public view override(ERC721, ERC721URIStorage) returns (bool){
       return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 _tokenId)public view override(ERC721,ERC721URIStorage) returns (string memory) {
        return super.tokenURI(_tokenId);
    }
}