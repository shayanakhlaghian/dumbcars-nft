// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract DumbCarsNFT is ERC721, Ownable {
  uint public mintPrice;
  uint public totalSupply;
  uint public maxSupply;
  uint public maxPerWallet;
  bool public isPublicMintEnabled;
  string public baseTokenUri;
  mapping(address => uint) public walletMints;

  constructor() ERC721("DumbCars", "DC") {
    mintPrice = 0.01 ether;
    totalSupply = 0;
    maxSupply = 25;
    maxPerWallet = 2;
  }

  function setIsPublicMintEnabled(bool _isPublicMintEnabled) external onlyOwner {
    isPublicMintEnabled = _isPublicMintEnabled;
  }

  function setBaseTokenUri(string calldata _baseTokenUri) external onlyOwner {
    baseTokenUri = _baseTokenUri;
  }

  function tokenURI(uint _tokenId) public view override returns(string memory) {
    require(_exists(_tokenId), "Token id does not exist.");

    return string(abi.encodePacked(
      baseTokenUri,
      Strings.toString(_tokenId),
      ".json"
    ));
  }

  function withdraw(address payable _withdrawWallet) external onlyOwner {
    (bool success, ) = _withdrawWallet.call{ value: address(this).balance }("");
    require(success, "Withdraw failed.");
  }

  function mint(uint _quantity) external payable {
    require(isPublicMintEnabled, "Public mint is not enabled.");
    require(totalSupply + _quantity <= maxSupply, "Sold out.");
    require(msg.value == mintPrice * _quantity, "Wrong value.");
    require(walletMints[msg.sender] + _quantity <= maxPerWallet, "More than max per wallet limit.");

    walletMints[msg.sender] = walletMints[msg.sender] + _quantity;

    for (uint i = 0; i < _quantity; i++) {
      uint newTokenId = totalSupply + 1;
      totalSupply++;
      _safeMint(msg.sender, newTokenId);
    }
  }
}