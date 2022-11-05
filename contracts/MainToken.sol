// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./IListableToken.sol";
import "./ListingContract.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract MainToken is IERC20, IListableToken {
  using SafeMath for uint256;
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

  uint constant public eth2TknConversionRate = 1;

  constructor() {}

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
    require(allowance[sender][msg.sender] >= amount, "insufficient allowance to recipient from msg sender");
    require(balanceOf[sender] >= amount, "insufficient balance in sender");
    
    allowance[sender][msg.sender] -= amount;
    balanceOf[sender] -= amount;
    balanceOf[recipient] += amount;
    emit Transfer(sender, recipient, amount);
    return true;
  }

  // a player has to provide some eth in exchange for hwang market token,
  // 1 wei = 1 HMTKN
  function mint(address _player, uint256 amount) external payable {
    uint256 _ethAmt = amount * (1 / eth2TknConversionRate);
    require(msg.value >= _ethAmt, "Insufficient msg value to cover eth amount");
    require(_ethAmt <= msg.sender.balance, "You do not have enough balance");

    balanceOf[_player] += amount;
    totalSupply += amount;
    totalEthSupply += msg.value;
    emit Transfer(address(this), _player, amount);
  }

  // player can exchange in HwangMarket tokens for eth
  function cashout(uint tokenAmt) external {
    require(balanceOf[msg.sender] >= tokenAmt, "insufficient balance in player");

    uint ethAmt = tokenAmt * (1 / eth2TknConversionRate);
    payable(msg.sender).transfer(ethAmt);
    balanceOf[msg.sender] -= tokenAmt;
    emit Transfer(msg.sender, address(this), tokenAmt);
    totalSupply -= tokenAmt;
    totalEthSupply -= ethAmt;
  }

  function burn(uint amount) external {
    require(balanceOf[msg.sender] >= amount, "insufficient balance in sender");
    balanceOf[msg.sender] -= amount;
    totalSupply -= amount;
    emit Transfer(msg.sender, address(0), amount);
  }

  function acceptTokenExchange(address listingAddress) external returns (Models.ListingInfo memory) {
    ListingContract listingContract = ListingContract(listingAddress);
    require(listingContract.token2() == address(this), "listing wants a different token2");
    require(balanceOf[msg.sender] >= listingContract.token2Amt(), "insufficient balance in sender");

    // perform approval
    allowance[msg.sender][listingAddress] = listingContract.token2Amt();
    emit Approval(msg.sender, listingAddress, listingContract.token2Amt());

    // trigger listing via main contract for book keeping
    Models.ListingInfo memory listingInfo = listingContract.trigger(msg.sender);

    return listingInfo;
  }
}