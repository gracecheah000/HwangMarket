// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract GameContract {

  enum GameStatus {
    OPEN,
    CLOSED
  }

  enum hasWithdrawn {
    YES,
    NO
  }

  address public creator; 
  GameStatus public status;
  mapping(address => uint256) betRecords;
  mapping(address => hasWithdrawn) winningWithdrawals;
  
  constructor(address _creator) {
    creator = _creator;
    status = GameStatus.OPEN;
  }

  // to check if message sent is by creator
  modifier isCreator(bool isEqual) {
    if (isEqual) {
      require(
        creator == msg.sender,
        "You are not the creator of this game!"
      );
    } else {
      require(creator != msg.sender, "You are the creator of this game.");
    }
    _;
  }

  // to get game information
  function getGameInfo() 
    public 
    view 
    returns (
      address,  // creator
      GameStatus // status
  ) {
    return (creator, status);
  }

  // payable keyword should allow depositing of ethereum into smart contract
  // allow msg.sender address to register as a player
  function addPlayer(address _player, uint256 _ethAmount) 
    payable
    public
    isCreator(false) {
      require(msg.value <= _player.balance, "You do not have enough balance"); 
      require(_player == msg.sender, "Invalid Transaction");
      require(msg.value == _ethAmount); 
      betRecords[msg.sender] = msg.value; // add players and corresponding amount deposited into mapping
    }

  // allow creator to cancel the game created.
  function cancelGame() public isCreator(true) {
    status = GameStatus.CLOSED;
  }

  // allow winners to withdraw their winnings
  function withdrawWinnings(address payable _player) public {
    require(msg.sender == _player);
    require(betRecords[msg.sender] == 0);
    // where to calculate amount of winnings
    uint256 amount = 0;
    _player.transfer(amount);
  }

  // to get smart contract's balance
  function getBalance() public view returns (uint256) {
    return address(this).balance;
  }

}
