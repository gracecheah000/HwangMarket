// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./GameContract.sol";

contract GameContractFactory {
  function createGame(address hmAddr, uint256 resolveTime, address oracleAddr, int256 threshold, string memory tag, string memory title, uint256 id) external returns (GameContract) {
    return new GameContract(hmAddr, resolveTime, oracleAddr, threshold, tag, title, id);
  }
}