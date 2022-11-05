// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./GameContract.sol";
import "./GameERC20TokenFactory.sol";

contract GameContractFactory {
  GameERC20TokenFactory private gameTokenFactory;

  constructor(address gameTokenFactoryAddr) {
    gameTokenFactory = GameERC20TokenFactory(gameTokenFactoryAddr);
  }

  function createGame(address hmAddr, uint256 resolveTime, address oracleAddr, int256 threshold, string memory tag, string memory title, uint256 id) external returns (address) {
    GameContract newGame = new GameContract(hmAddr, resolveTime, oracleAddr, threshold, tag, title, id);
    address gytAddr = gameTokenFactory.createGameERC20Token(address(newGame), "GameYes", "GYT", 1000);
    address gntAddr = gameTokenFactory.createGameERC20Token(address(newGame), "GameNo", "GNT", 1000);
    newGame.initTokenAddr(gytAddr, gntAddr);

    return address(newGame);
  }
}