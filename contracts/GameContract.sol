// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./HwangMarket.sol";
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


  // Trx types constant
  string constant BetActivityType = "BET";
  string constant SellActivityType = "SELL";

  // for every record, we track a list of transactions
  struct Trx {
    // Common fields
    uint256 trxId;
    string activityType;  // "BET", "SELL"
    uint256 trxAmt;
    uint256 trxTime; // when the trx was initiated
    uint8 gameSide;

    // if BET, from = game contract addr, to = player addr
    // if SELL, from = seller addr, to = buyer addr
    address from;
    address to;
  }
  Trx[] trxs;
  uint256 internal trxId;

  HwangMarket public mainContract;

  // constructor takes in a resolve time, a oracleAddr (oracle address), and a threshold, 
  // where a gameSide of NO indicates < threshold, and a gameSide of YES indicates >= threshold
  constructor(address payable _creator, uint256 resolveTime, address oracleAddr, int256 thres) {
    creator = _creator;
    mainContract = HwangMarket(_creator);
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
      GameStatus, // status
      gameSide,
      uint256,
      int256
  ) {
    return (creator, status, gameOutcome, gameResolveTime, threshold);
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
      require(betSide == 1 || betSide == 2, "bet side is not recognised");
      require(block.timestamp <= gameResolveTime, "cannot put bets after resolve time");
      
      // book keeping
      betRecords[_player] = msg.value; // add players and corresponding amount deposited into mapping
      gameSide side = gameSide.NO; // 1 - YES, 2 - NO
      if (betSide == 1) {
        side = gameSide.YES;
      }
      betSides[_player] = side; // add player to side he bets on
      amtPlacedOnSide[side] += _ethAmount;

      trxs.push(Trx({
        trxId: trxId,
        activityType: BetActivityType,
        gameSide: betSide,
        trxAmt: _ethAmount,
        trxTime: block.timestamp,
        from: address(this),
        to: _player
      }));
      trxId++;

      mainContract.playerJoinedSide(_player, betSide, _ethAmount, block.timestamp);
    }

  // for now, we return all, can consider performing pagination here
  function getTrxs() external view returns(Trx[] memory) {
    return trxs;
  }

  // disable any backdoor by creator
  // // allow creator to cancel the game created.
  // function cancelGame() public isCreator(true) {
  //   status = GameStatus.CLOSED;
  // }

  function getSideAmt(uint8 s) public view returns (uint256) {
    require((s == 1 || s == 2), "side must be one of 1 or 2");
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
    uint8 rawSide = 2;
    if (getLatestPrice() >= threshold) {
      side = gameSide.YES;
      rawSide = 1;
    }
    gameOutcome = side;

    mainContract.concludeGame(rawSide);
  }

  // allow winners to withdraw their winnings
  function withdrawWinnings(address payable _player) public {
    require(msg.sender == _player, "cannot withdraw on someone behalf"); //restrict only winner can withdraw his/her own winnings
    require(betRecords[msg.sender] > 0, "player must have bet something"); // player must have bet something
    require(status == GameStatus.CLOSED, "game is not yet closed"); // game must be closed
    require(gameOutcome == betSides[_player], "player must be on winning side"); // player must be on winning side
    require(gameOutcome != gameSide.UNKNOWN, "game outcome cannot be unknown"); // game outcome cannot be unknown
    require(winningWithdrawals[_player] != hasWithdrawn.YES, "player has already withdrawn winnings"); // player must not have already withdrawn

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
