// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./GameERC20Token.sol";

contract GameERC20TokenFactory {
  function createGameERC20Token(address gameAddr, string memory _name, string memory _symbol, uint _supplyLimit) external returns (address) {
    return address(new GameERC20Token(gameAddr, _name, _symbol, _supplyLimit));
  }
}