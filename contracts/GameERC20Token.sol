// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./IListableToken.sol";
import "./GameContract.sol";
import "./ListingContract.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract GameERC20Token is IERC20, IListableToken {
  using SafeMath for uint256;
  
  uint public supplyLimit;
  uint public totalSupply;
  mapping(address => uint) public balanceOf;
  mapping(address => mapping(address => uint)) public allowance;
  string public name;
  string public symbol;
  GameContract gameContract;

  constructor(address gameAddr, string memory _name, string memory _symbol, uint _supplyLimit) {
    name = _name;
    symbol = _symbol;
    supplyLimit = _supplyLimit;
    totalSupply = 0;
    gameContract = GameContract(gameAddr);
  }

  function transfer(address recipient, uint amount) external returns (bool) {
    require(balanceOf[msg.sender] >= amount);
    balanceOf[msg.sender] -= amount;
    balanceOf[recipient] += amount;
    allowance[msg.sender][recipient] -= amount;
    emit Transfer(msg.sender, recipient, amount);
    return true;
  }

  function approve(address spender, uint amount) external returns (bool) {
    require(balanceOf[msg.sender] >= amount);
    allowance[msg.sender][spender] = amount;
    emit Approval(msg.sender, spender, amount);
    return true;
  }

  // similar to transfer but difference is that someone else is authorised to
  // trigger the transfer
  function transferFrom(
    address sender,
    address recipient,
    uint amount
  ) external returns (bool) {
    require(allowance[sender][msg.sender] >= amount);
    require(balanceOf[sender] >= amount);
    
    // totalAllowanceCommited[sender] -= amount;
    allowance[sender][msg.sender] -= amount;
    balanceOf[sender] -= amount;
    balanceOf[recipient] += amount;
    emit Transfer(sender, recipient, amount);
    return true;
  }

  // a player has to provide some HMTKN in exchange for the game token,
  // 1 HMTKN = 1 gametoken
  function mint(address _player, uint amount) external {
    require(totalSupply + amount <= supplyLimit);
    balanceOf[_player] += amount;
    totalSupply += amount;

    emit Transfer(address(0), _player, amount);
  }

  function burn(uint amount) external {
    require(balanceOf[msg.sender] >= amount);
    balanceOf[msg.sender] -= amount;
    totalSupply -= amount;
    emit Transfer(msg.sender, address(0), amount);
  }

  // player1 has to approve the token1 amount to the listing contract for spending
  function listUpTokensForExchange(uint256 token1Amt, address token2, uint256 token2Amt) external returns (Models.ListingInfo memory) {
    require(balanceOf[msg.sender] >= token1Amt);

    // create a listing and approve the transfer amount for the newly listed contract
    Models.ListingInfo memory listingInfo = gameContract.newListing(msg.sender, token1Amt, token2, token2Amt);
    address listingAddress = listingInfo.listingAddr;
    allowance[msg.sender][listingAddress] = token1Amt;
    emit Approval(msg.sender, listingAddress, token1Amt);

    return listingInfo;
  }

  function acceptTokenExchange(address listingAddress) external returns (Models.ListingInfo memory) {
    ListingContract listingContract = ListingContract(listingAddress);
    require(listingContract.token2() == address(this));
    require(balanceOf[msg.sender] >= listingContract.token2Amt());

    // perform approval
    allowance[msg.sender][listingAddress] = listingContract.token2Amt();
    // totalAllowanceCommited[msg.sender] += listingContract.token2();
    emit Approval(msg.sender, listingAddress, listingContract.token2Amt());

    // trigger listing via main contract for book keeping
    Models.ListingInfo memory listingInfo = listingContract.trigger(msg.sender);

    return listingInfo;
  }
}