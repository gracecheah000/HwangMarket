// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

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
  int256 public threshold;
  mapping(address => gameSide) public betSides; // whether user bets yes or no
  mapping(address => uint256) public betRecords; // bet amount user committed (in wei)
  mapping(address => hasWithdrawn) public winningWithdrawals; // indicate if user has already withdrawn winnings
  mapping(gameSide => uint256) public amtPlacedOnSide; // remember how much amount is placed on each side
  AggregatorV3Interface internal priceFeed;

  // constructor takes in a resolve time, a oracleAddr (oracle address), and a threshold, 
  // where a gameSide of NO indicates < threshold, and a gameSide of YES indicates >= threshold
  constructor(address _creator, uint256 resolveTime, address oracleAddr, int256 thres) {
    creator = _creator;
    status = GameStatus.OPEN;
    gameResolveTime = resolveTime; // set when the game is allowed to conclude
    gameOutcome = gameSide.UNKNOWN; // explicitly set gameOutcome to undecided
    
    priceFeed = AggregatorV3Interface(oracleAddr);
    threshold = thres;
  }

  /**
    * Returns the latest price
    */
  function getLatestPrice() public view returns (int) {
      (
          /*uint80 roundID*/,
          int price,
          /*uint startedAt*/,
          /*uint timeStamp*/,
          /*uint80 answeredInRound*/
      ) = priceFeed.latestRoundData();
      return price;
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
      require(block.timestamp <= gameResolveTime, "cannot put bets after resolve time");
      
      // book keeping
      betRecords[_player] = msg.value; // add players and corresponding amount deposited into mapping
      gameSide side = gameSide.NO; // 0 - NO, 1 - YES
      if (betSide == 1) {
        side = gameSide.YES;
      }
      betSides[_player] = side; // add player to side he bets on
      amtPlacedOnSide[side] += _ethAmount;
    }

  // disable any backdoor by creator
  // // allow creator to cancel the game created.
  // function cancelGame() public isCreator(true) {
  //   status = GameStatus.CLOSED;
  // }

  function getSideAmt(uint8 s) public view returns (uint256) {
    // require(s == 0 || s == 1, "side must be one of 0 or 1");
    gameSide side = gameSide.NO;
    if (s == 1) {
      side = gameSide.YES;
    }

    return amtPlacedOnSide[side];
  }

  // impt: anyone can call the contract to perform upkeep but it has a guard to protect against early resolves
  // and it checks against a "trusted" oracle chainlink to fetch the result
  function performUpkeep() public {
    require(block.timestamp >= gameResolveTime, "game is not ready to be resolved");
    require(status != GameStatus.CLOSED, "game is already closed");

    status = GameStatus.CLOSED;
    gameSide side = gameSide.NO;
    if (getLatestPrice() >= threshold) {
      side = gameSide.YES;
    }
    gameOutcome = side;
  }

  // allow winners to withdraw their winnings
  function withdrawWinnings(address payable _player) public {
    require(msg.sender == _player, "cannot withdraw on someone behalf"); //restrict only winner can withdraw his/her own winnings
    require(betRecords[msg.sender] > 0); // player must have bet something
    require(status == GameStatus.CLOSED); // game must be closed
    require(gameOutcome == betSides[_player]); // player must be on winning side
    require(gameOutcome != gameSide.UNKNOWN); // player must be on winning side
    require(gameOutcome != hasWithdrawn.YES); // player must not have already withdrawn

    // where to calculate amount of winnings
    // calculated winnings = (player's bet amount / total bet amount on winning side) * total bet amount on losing side
    gameSide oppSide = gameSide.NO;
    if (gameOutcome == gameSide.NO) {
      oppSide = gameSide.YES;
    }
    uint256 winnings = (betRecords[_player] / amtPlacedOnSide[gameOutcome]) * amtPlacedOnSide[oppSide];
    _player.transfer(winnings + betRecords[_player]);
    winningWithdrawals[_player] = hasWithdrawn.YES;
  }

  // to get smart contract's balance
  function getBalance() public view returns (uint256) {
    return address(this).balance;
  }

  // @notice Will receive any eth sent to the contract
  receive() external payable {
  }
}
