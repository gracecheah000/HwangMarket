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
  function createGame() public {
    GameContract newGame = new GameContract(msg.sender);
    gameContractRegistry[gameCount] = address(newGame);
    gameCount = SafeMath.add(gameCount, 1);
  }

}
