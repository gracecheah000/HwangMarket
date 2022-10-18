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

  enum gameSide {
    UNKNOWN,
    YES,
    NO
  }

  address public creator; 
  GameStatus public status;
  gameSide public gameOutcome;
  uint256 public gameResolveTime;
  mapping(address => gameSide) public betSides; // whether user bets yes or no
  mapping(address => uint256) public betRecords; // bet amount user committed (in wei)
  mapping(address => hasWithdrawn) public winningWithdrawals; // indicate if user has already withdrawn winnings
  mapping(gameSide => uint256) public amtPlacedOnSide; // remember how much amount is placed on each side
  
  constructor(address _creator, uint256 resolveTime) {
    creator = _creator;
    status = GameStatus.OPEN;
    gameResolveTime = resolveTime; // set when the game is allowed to conclude
    gameOutcome = gameSide.UNKNOWN; // explicitly set gameOutcome to undecided
  }

  // to check if message sent is by creator
  modifier isCreator(bool isEqual) {
    if (isEqual) {
      require(
        creator == msg.sender,
        "You are not the creator of this game!"
      );
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
  function addPlayer(address _player, uint256 _ethAmount, uint8 betSide)
    payable
    public
    isCreator(false) {
      require(msg.value <= _player.balance, "You do not have enough balance"); 
      require(_player == msg.sender, "Invalid Transaction");
      require(msg.value == _ethAmount, "Msg value not equal to eth amount specified"); 
      require(status == GameStatus.OPEN, "Game is closed, no further bets accepted");
      require(betSide == 0 || betSide == 1, "bet side is not recognised");
      
      // book keeping
      betRecords[msg.sender] = msg.value; // add players and corresponding amount deposited into mapping
      gameSide side = gameSide.NO; // 0 - NO, 1 - YES
      if (betSide == 1) {
        side = gameSide.YES;
      }
      betSides[msg.sender] = side; // add player to side he bets on
      amtPlacedOnSide[side] += _ethAmount;
    }

  // allow creator to cancel the game created.
  function cancelGame() public isCreator(true) {
    status = GameStatus.CLOSED;
  }

  function getSideAmt(uint8 s) public view returns (uint256) {
    // require(s == 0 || s == 1, "side must be one of 0 or 1");
    gameSide side = gameSide.NO;
    if (s == 1) {
      side = gameSide.YES;
    }

    return amtPlacedOnSide[side];
  }

  // TODO: get decision from oracle instead, for now we let creater close and set game outcome
  function performUpkeep(uint8 _gameOutcome) public isCreator(true) {
    require(block.timestamp >= gameResolveTime);
    require(_gameOutcome == 0 || _gameOutcome == 1, "bet side is not recognised");
    status = GameStatus.CLOSED;
    gameSide side = gameSide.NO;
    if (_gameOutcome == 1) {
      side = gameSide.YES;
    }
    gameOutcome = side;
  }

  // allow winners to withdraw their winnings
  function withdrawWinnings(address payable _player) public {
    require(msg.sender == _player); //restrict only winner can withdraw his/her own winnings
    require(betRecords[msg.sender] > 0); // player must have bet something
    require(status == GameStatus.CLOSED); // game must be closed
    require(gameOutcome == betSides[_player]); // player must be on winning side
    require(gameOutcome != gameSide.UNKNOWN); // player must be on winning side

    // where to calculate amount of winnings
    // calculated winnings = (player's bet amount / total bet amount on winning side) * total bet amount on losing side
    gameSide oppSide = gameSide.NO;
    if (gameOutcome == gameSide.NO) {
      oppSide = gameSide.YES;
    }
    uint256 winnings = (betRecords[_player] / amtPlacedOnSide[gameOutcome]) * amtPlacedOnSide[oppSide];
    _player.transfer(winnings);
  }

  // to get smart contract's balance
  function getBalance() public view returns (uint256) {
    return address(this).balance;
  }

  // @notice Will receive any eth sent to the contract
  receive() external payable {
  }
}
