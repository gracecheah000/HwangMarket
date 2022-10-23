// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MainToken is IERC20 {
  /*
    IERC20 implementation
  */
  uint public totalSupply;
  mapping(address => uint) public balanceOf;
  mapping(address => mapping(address => uint)) public allowance;
  string public name = "HwangMarket";
  string public symbol = "HMTKN";
  uint8 public decimals = 18;
  uint256 public totalEthSupply = 0;
  address creator;

  uint constant eth2TknConversionRate = 1;

  constructor() {
    creator = msg.sender;
  }

  function transfer(address recipient, uint amount) external returns (bool) {
    require(allowance[msg.sender][recipient] >= amount, "insufficient allowance from sender to recipient");
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
    require(allowance[sender][recipient] >= amount, "insufficient allowance to recipient from sender");
    require(balanceOf[sender] >= amount, "insufficient balance in sender");
    
    allowance[sender][recipient] -= amount;
    balanceOf[sender] -= amount;
    balanceOf[recipient] += amount;
    emit Transfer(sender, recipient, amount);
    return true;
  }

  // a player has to provide some eth in exchange for hwang market token,
  // 1 wei = 1 HMTKN
  function mint(address _player, uint amount, uint256 _ethAmount) external payable {
    require(msg.value <= _player.balance, "You do not have enough balance");
    require(msg.value == _ethAmount, "eth amount specified not equal to msg value");
    require(amount == _ethAmount * eth2TknConversionRate, "eth amount offered does not match amount of HMTKN token requested"); 

    balanceOf[_player] += amount;
    totalSupply += amount;
    totalEthSupply += amount;
    emit Transfer(address(0), _player, amount);
  }

  // player can exchange in HwangMarket tokens for eth
  function cashout(address payable _player, uint tokenAmt) external {
    require(_player == msg.sender, "Invalid Transaction");
    require(allowance[msg.sender][address(this)] >= tokenAmt, "insufficient allowance in player to contract");
    require(balanceOf[msg.sender] >= tokenAmt, "insufficient balance in player");
    uint ethAmt = tokenAmt * (1 / eth2TknConversionRate);
    _player.transfer(ethAmt);
    balanceOf[_player] -= tokenAmt;
    totalSupply -= tokenAmt;
    totalEthSupply -= ethAmt;
  }

  function burn(uint amount) external {
    require(balanceOf[msg.sender] >= amount, "insufficient balance in sender");
    balanceOf[msg.sender] -= amount;
    totalSupply -= amount;
    emit Transfer(msg.sender, address(0), amount);
  }

  // to get smart contract's balance
  function getBalance() public view returns (uint256) {
    return address(this).balance;
  }

  // @notice Will receive any eth sent to the contract
  receive() external payable {
  }
}