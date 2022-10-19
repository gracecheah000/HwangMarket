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

  event GameCreated(address gameAddr);

  struct GameIdAndAddr {
    uint256 id;
    address addr;
  }

  // create game contract instance
  function createGame(uint256 resolveTime, address oracleAddr, int256 threshold) public returns (address) {
    // 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e   <- Goerli ETH / USD
    // 135000000000 <- 1350 USD
    // for testing purposes, only allow resolve after 5min from contract creation from now
    // the contract below bets if eth will break 1350 USD after mins
    GameContract newGame = new GameContract(msg.sender, resolveTime, oracleAddr, threshold); 
    gameContractRegistry[gameCount] = address(newGame);
    
    emit GameCreated(address(newGame));
    gameCount = SafeMath.add(gameCount, 1);

    return address(newGame);
  }

  function getAllGames() public view returns (GameIdAndAddr[] memory) {
    GameIdAndAddr[] memory res = new GameIdAndAddr[](gameCount);
    for (uint256 j=0; j<gameCount; j++) {
      res[j] = GameIdAndAddr({id: j, addr: gameContractRegistry[gameCount]});
    }

    return res;
  }

  // @notice Will receive any eth sent to the contract
  receive() external payable {
  }
}
