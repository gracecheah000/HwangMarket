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
    GameContract newGame = new GameContract(msg.sender, block.timestamp + 100); // only resolve after 100s from now
    gameContractRegistry[gameCount] = address(newGame);
    gameCount = SafeMath.add(gameCount, 1);

    return gameContractRegistry[gameCount];
  }

  // @notice Will receive any eth sent to the contract
  receive() external payable {
  }
}
