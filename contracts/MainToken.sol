// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./HwangMarket.sol";
import "./IListableToken.sol";
import "./ListingContract.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MainToken is IERC20, IListableToken {
  /*
    IERC20 implementation
  */
  uint public totalSupply;
  mapping(address => uint) public balanceOf;
  // mapping(address => uint) public totalAllowanceCommited;
  mapping(address => mapping(address => uint)) public allowance;
  string public name = "HwangMarket";
  string public symbol = "HMTKN";
  uint8 public decimals = 18;
  uint256 public totalEthSupply = 0;
  address public creator;
  HwangMarket public mainContract;

  uint constant public eth2TknConversionRate = 1;

  constructor() {
    creator = msg.sender;
    mainContract = HwangMarket(payable(msg.sender));
  }

  function transfer(address recipient, uint amount) external returns (bool) {
    require(balanceOf[msg.sender] >= amount, "insufficient balance in sender");
    // totalAllowanceCommited[msg.sender] -= amount;
    balanceOf[msg.sender] -= amount;
    balanceOf[recipient] += amount;
    emit Transfer(msg.sender, recipient, amount);
    return true;
  }

  function approve(address spender, uint amount) external returns (bool) {
    require(balanceOf[msg.sender] >= amount, "insufficient balance in sender");
    // require(totalAllowanceCommited[msg.sender] + amount <= balanceOf[msg.sender], "total allowance for approver overcommited, you cannot allow more than you own");
    // totalAllowanceCommited[msg.sender] += amount;
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
    
    // totalAllowanceCommited[sender] -= amount;
    allowance[sender][msg.sender] -= amount;
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
  function cashout(uint tokenAmt) external {
    require(balanceOf[msg.sender] >= tokenAmt, "insufficient balance in player");

    // totalAllowanceCommited[msg.sender] -= tokenAmt;
    uint ethAmt = tokenAmt * (1 / eth2TknConversionRate);
    payable(msg.sender).transfer(ethAmt);
    balanceOf[msg.sender] -= tokenAmt;
    totalSupply -= tokenAmt;
    totalEthSupply -= ethAmt;
  }

  function burn(uint amount) external {
    require(balanceOf[msg.sender] >= amount, "insufficient balance in sender");
    balanceOf[msg.sender] -= amount;
    totalSupply -= amount;
    emit Transfer(msg.sender, address(0), amount);
  }

  // player1 has to approve the token1 amount to the listing contract for spending
  function listUpTokensForExchange(uint256 token1Amt, address token2, uint256 token2Amt) external returns (Models.ListingInfo memory) {
    require(balanceOf[msg.sender] >= token1Amt, "insufficient balance in sender");
    // require(totalAllowanceCommited[msg.sender] + token1Amt <= balanceOf[msg.sender], "total allowance for approver overcommited, you cannot allow more than you own");

    // create a listing and approve the transfer amount for the newly listed contract
    Models.ListingInfo memory listingInfo = mainContract.newListing(msg.sender, token1Amt, token2, token2Amt);
    address listingAddress = listingInfo.listingAddr;
    allowance[msg.sender][listingAddress] = token1Amt;
    // totalAllowanceCommited[msg.sender] += token1Amt;
    emit Approval(msg.sender, listingAddress, token1Amt);

    return listingInfo;
  }

  function acceptTokenExchange(address listingAddress) external returns (Models.ListingInfo memory) {
    ListingContract listingContract = ListingContract(listingAddress);
    require(listingContract.token2() == address(this), "listing wants a different token2");
    require(balanceOf[msg.sender] >= listingContract.token2Amt(), "insufficient balance in sender");
    // require(totalAllowanceCommited[msg.sender] + listingContract.token2Amt() <= balanceOf[msg.sender], "total allowance for approver overcommited, you cannot allow more than you own");

    // perform approval
    allowance[msg.sender][listingAddress] = listingContract.token2Amt();
    // totalAllowanceCommited[msg.sender] += listingContract.token2();
    emit Approval(msg.sender, listingAddress, listingContract.token2Amt());

    // trigger listing via main contract for book keeping
    Models.ListingInfo memory listingInfo = mainContract.partakeInListing(msg.sender, listingAddress);

    return listingInfo;
  }

  // to get smart contract's balance
  function getBalance() public view returns (uint256) {
    return address(this).balance;
  }

  // @notice Will receive any eth sent to the contract
  receive() external payable {
  }
}