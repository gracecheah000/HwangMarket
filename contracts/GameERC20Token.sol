// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract GameERC20Token is IERC20 {
  uint public supplyLimit;
  uint public totalSupply;
  mapping(address => uint) public balanceOf;
  mapping(address => mapping(address => uint)) public allowance;
  string public name;
  string public symbol;
  address creator;

  constructor(string memory _name, string memory _symbol, uint _supplyLimit) {
    creator = msg.sender;
    name = _name;
    symbol = _symbol;
    supplyLimit = _supplyLimit;
    totalSupply = 0;
  }

  function transfer(address recipient, uint amount) external returns (bool) {
    require(balanceOf[msg.sender] >= amount, "insufficient balance in sender");
    balanceOf[msg.sender] -= amount;
    balanceOf[recipient] += amount;
    emit Transfer(msg.sender, recipient, amount);
    return true;
  }

  function approve(address spender, uint amount) external returns (bool) {
    require(balanceOf[msg.sender] >= amount, "insufficient balance in sender");
    allowance[msg.sender][spender] = amount;
    emit Approval(msg.sender, spender, amount);
    return true;
  }

  function transferFrom(
    address sender,
    address recipient,
    uint amount
  ) external returns (bool) {
    require(allowance[msg.sender][recipient] >= amount, "insufficient allowance to recipient from sender");
    require(balanceOf[msg.sender] >= amount, "insufficient balance in sender");
    
    allowance[sender][recipient] -= amount;
    balanceOf[sender] -= amount;
    balanceOf[recipient] += amount;
    emit Transfer(sender, recipient, amount);
    return true;
  }

  // a player has to provide some HMTKN in exchange for the game token,
  // 1 HMTKN = 1 gametoken
  function mint(address _player, uint amount) external {
    require(msg.sender == creator, "Not authorized");
    require(totalSupply + amount <= supplyLimit, "cannot mint the requested amount of tokens, supply limit too low");
    balanceOf[_player] += amount;
    totalSupply += amount;

    emit Transfer(address(0), _player, amount);
  }

  function burn(uint amount) external {
    require(balanceOf[msg.sender] >= amount, "insufficient balance in sender");
    balanceOf[msg.sender] -= amount;
    totalSupply -= amount;
    emit Transfer(msg.sender, address(0), amount);
  }
}