// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./HwangMarket.sol";
import "./IterableMapping.sol";
import "./GameERC20Token.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract GameContract {
  using IterableMapping for IterableMapping.Map;

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

  mapping(gameSide => uint256) public amtPlacedOnSide; // remember how much amount is placed on each side in terms of HMTKN
  AggregatorV3Interface internal priceFeed;


  // Trx types constant
  string constant BetActivityType = "BET";
  string constant WithdrawActivityType = "WITHDRAW";
  string constant SellActivityType = "SELL";

  // conversion rate from 1 HMTKN to 1 Game Token
  uint constant mainTkn2GameTknConversionRate = 1;
  uint constant supplyLimit = 1000;

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

  address public gameNoTokenContractAddress;
  GameERC20Token public gameNoTokenContract;
  address public gameYesTokenContractAddress;
  GameERC20Token public gameYesTokenContract;

  uint256 public listingContractsCount;
  IterableMapping.Map private listingContracts;

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

    // every game contract deploys 2 IERC20 token contracts
    // yes and no tokens
    gameNoTokenContract = new GameERC20Token("GameNoToken", "GNT", supplyLimit);
    gameNoTokenContractAddress = address(gameNoTokenContract);
    gameYesTokenContract = new GameERC20Token("GameYesToken", "GYT", supplyLimit);
    gameYesTokenContractAddress = address(gameYesTokenContract);
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
  function addPlayer(address _player, uint256 hwangMktTokenAmt, uint8 betSide)
    public
    isCreator(false) {
      require(_player == msg.sender, "Invalid Transaction");
      require(status == GameStatus.OPEN, "Game is closed, no further bets accepted");
      require(betSide == 1 || betSide == 2, "bet side is not recognised");
      require(block.timestamp <= gameResolveTime, "cannot put bets after resolve time");
      require(mainContract.mainToken().allowance(_player, address(this)) >= hwangMktTokenAmt, "player's hwang market token allowance too low");
      require(mainContract.mainToken().balanceOf(_player) >= hwangMktTokenAmt, "player's hwang market token balance too low");
      gameSide side = gameSide.NO; // 1 - YES, 2 - NO
      if (betSide == 1) {
        side = gameSide.YES;
      }
      GameERC20Token gameTokenContract = gameNoTokenContract;
      if (betSide == 1) {
        gameTokenContract = gameYesTokenContract;
      }
      uint256 requestedMintAmt = hwangMktTokenAmt * mainTkn2GameTknConversionRate;
      require(gameTokenContract.totalSupply() + requestedMintAmt <= gameTokenContract.supplyLimit(), "game token cannot mint requested amount");

      // mint the respective 1-1 game token to the player
      gameTokenContract.mint(_player, requestedMintAmt);
      // collect the player's main token, deposit under the game address
      _safeTransferFrom(mainContract.mainToken(), _player, address(this), hwangMktTokenAmt);

      // book keeping
      amtPlacedOnSide[side] += hwangMktTokenAmt;
      uint256 timestamp = block.timestamp;
      trxs.push(Trx({
        trxId: trxId,
        activityType: BetActivityType,
        gameSide: betSide,
        trxAmt: hwangMktTokenAmt,
        trxTime: timestamp,
        from: address(this),
        to: _player
      }));
      trxId++;

      mainContract.playerJoinedSide(_player, betSide, hwangMktTokenAmt, timestamp);
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

  // allow winners to withdraw their winnings in term of HMTKN
  function withdrawWinnings(address _player, uint withdrawAmt) public {
    require(msg.sender == _player, "cannot withdraw on someone behalf"); //restrict only winner can withdraw his/her own winnings
    require(status == GameStatus.CLOSED, "game is not yet closed"); // game must be closed
    require(gameOutcome != gameSide.UNKNOWN, "game outcome cannot be unknown"); // game outcome cannot be unknown
    IERC20 gameTokenContract = gameNoTokenContract;
    if (gameOutcome == gameSide.YES) {
      gameTokenContract = gameYesTokenContract;
    }
    require(gameTokenContract.balanceOf(_player) >= withdrawAmt, "player must approve withdraw amount");
    require(gameTokenContract.allowance(_player, address(this)) >= withdrawAmt, "player must approve withdraw amount");

    // where to calculate amount of winnings
    // calculated winnings = (player's bet amount / total bet amount on winning side) * total bet amount on losing side
    gameSide oppSide = gameSide.NO;
    if (gameOutcome == gameSide.NO) {
      oppSide = gameSide.YES;
    }
    uint256 hwangMarketTokenAmt = (1 / mainTkn2GameTknConversionRate) * withdrawAmt;
    uint256 winnings = ((hwangMarketTokenAmt / amtPlacedOnSide[gameOutcome]) * amtPlacedOnSide[oppSide]) + hwangMarketTokenAmt;
    
    // game now approves hwangmarket token winnings transfer to player
    mainContract.mainToken().approve(_player, winnings);

    // initiate transfer of hwang market tokens from game to player
    _safeTransferFrom(mainContract.mainToken(), address(this), _player, winnings);
    // initiate transfer of game token from player back to game
    _safeTransferFrom(gameTokenContract, _player, address(this), withdrawAmt);

    uint8 betSide = 2;
    if (gameOutcome == gameSide.YES) {
      betSide = 1;
    }
    uint256 timestamp = block.timestamp;
    trxs.push(Trx({
      trxId: trxId,
      activityType: WithdrawActivityType,
      gameSide: betSide,
      trxAmt: winnings,
      trxTime: timestamp,
      from: address(this),
      to: _player
    }));
    trxId++;
    mainContract.playerWithdrawWinnings(_player, betSide, winnings, timestamp);
  }

  // function playerAddListing(address _player, )

  // to get smart contract's balance
  function getBalance() public view returns (uint256) {
    return address(this).balance;
  }

  // @notice Will receive any eth sent to the contract
  receive() external payable {
  }

  function _safeTransferFrom(
    IERC20 token,
    address sender,
    address recipient,
    uint amount
    ) private {
      bool sent = token.transferFrom(sender, recipient, amount);
      require(sent, "Token transfer failed");
    }
}
