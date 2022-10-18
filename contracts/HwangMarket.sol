// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./GameContract.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract HwangMarket {
  using SafeMath for uint256;

  uint256 private gameCount;
  mapping(uint256 => address) public gameContractRegistry;
  constructor() public {
  }

  // create game contract instance
  function createGame() public returns (address) {
    // 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e   <- Goerli ETH / USD
    // for testing purposes, only allow resolve after 5min from contract creation from now
    // the contract below bets if eth will break 1350 USD after mins
    GameContract newGame = new GameContract(msg.sender, block.timestamp + 300, 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e, 135000000000); 
    gameContractRegistry[gameCount] = address(newGame);
    gameCount = SafeMath.add(gameCount, 1);

    return gameContractRegistry[gameCount];
  }

  // @notice Will receive any eth sent to the contract
  receive() external payable {
  }
}
