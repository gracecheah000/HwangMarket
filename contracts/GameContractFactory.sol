// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./GameContract.sol";

contract GameContractFactory {
  function createGame(address addr,uint256 resolveTime, address oracleAddr, int256 threshold) external returns (GameContract) {
    return new GameContract(addr, resolveTime, oracleAddr, threshold);
  }
}