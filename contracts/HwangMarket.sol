// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./GameContract.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract HwangMarket {
  using SafeMath for uint256;

  struct GameMetadata {
    uint256 id;
    address addr;
    string tag;
    string title;
    address oracleAddr;
    uint256 resolveTime;
    int256 threshold;

    uint256 totalAmount;
    uint256 betYesAmount;
    uint256 betNoAmount;
    bool ongoing;
    uint8 gameOutcome;
  }

  // for all activity
  uint256 private trxId;

  // for all games created
  uint256 private gameCount;
  mapping(uint256 => GameMetadata) public gameContractRegistry;
  mapping(address => uint256) public gameAddr2Id;
  
  // for all ongoing games
  uint256 private ongoingGamesCnt; // record end of ongoing games array
  GameMetadata[] public ongoingGames;
  mapping(uint256 => uint256) ongoingGamesId2Idx;

  // for all closed games
  GameMetadata[] public closedGames;

  struct GameSideAndAmount {
    uint8 side;
    uint256 amt;
  }

  // Activity types constant
  string constant BetActivityType = "BET";
  string constant SellActivityType = "SELL";
  string constant WithdrawActivityType = "WITHDRAW";

  // keep track of players' address bet on what game and their bet amount, and side
  // we keep such a mapping instead of delegating it to the game contract
  // to support more efficient lookup + since reads are more common than writes
  // we will stand to gain from gas free view calls to read this mapping from outside the chain
  // than to call a view function from main contract to game contract which costs gas
  // Also, note: players are able to play on both sides if they wish, and are allowed to bet more if they wish
  // but are not allowed to "cancel" bets unless they "sell" to other players
  // {player_address -> game_id -> betSide -> amount}
  mapping(address => mapping(uint256 => mapping(uint8 => uint256))) public playerExistingPositions;

  // Also, it might prove to be useful to be able to support efficient queries 
  // for player's ongoing bets, pending wins to claim and historical bets
  // The following data structure are meant to faciliatate such queries.
  struct BetInfo {
    uint256 trxId;
    uint256 gameId;
    uint8 betSide; // 1 - YES, 2 - NO
    uint256 amt;

    uint8 betOutcome; // 0 - UNKNOWN, 1 - YES, 2 - NO
  }
  // record all ongoing bets for a player
  mapping(address => BetInfo[]) public ongoingBets;
  // pointer to mark end of BetInfo[] to support efficient deletion of items in array
  // For example, we can simply replace the last item in betInfo to replace the item to delete
  // and simply shrink this pointer, of course, readjusting the last item's index to now be the deleted index
  mapping(address => uint256) public ongoingBetsSize; 
  mapping(uint256 => uint256) public ongoingBetsTrxId2Idx; // map game_id -> idx

  // record all pendingWin bets for a player, same idea as above
  mapping(address => BetInfo[]) public pendingWins;
  mapping(address => uint256) public pendingWinsSize;
  mapping(uint256 => uint256) public pendingWinsTrxId2Idx;

  // record all historical bets for a player, same idea as above
  mapping(address => BetInfo[]) public historicalBets;
  mapping(address => uint256) public historicalBetsSize;
  mapping(uint256 => uint256) public historicalBetsTrxId2Idx;

  // Additionally, we want to keep a record of all player's movements on chain.
  // That is, we want to record everytime a player bets (buys a position), or sells his position (and to who), or withdraws his winnings
  struct Activity {
    // Common fields
    uint256 trxId;
    string activityType;  // "BET", "SELL", "WITHDRAW"
    uint256 gameId;
    uint256 trxAmt;
    uint256 trxTime; // when the trx was initiated
    uint8 gameSide; // 1 - YES, 2 - NO
    address from;
    address to;
  }
  mapping(address => Activity[]) public playersRecords;
  

  constructor() {
    // we start counting from game 1, game id 0 is nonsense since its also default value
    gameCount = 1;
  }

  event GameCreated(GameMetadata gameMetadata);
  event PlayerJoinedGameEvent(address player, uint256 gameId, address gameAddr, uint8 betSide, uint256 amount);
  event GameConcluded(uint256 gameId, address gameAddr, uint8 gameOutcome);

  // create game contract instance
  function createGame(uint256 resolveTime, address oracleAddr, int256 threshold, string memory tag, string memory title) public returns (address) {
    GameContract newGame = new GameContract(payable(address(this)), resolveTime, oracleAddr, threshold); 
    address newGameAddress = address(newGame);
    gameContractRegistry[gameCount] = GameMetadata({
      id: gameCount,
      addr: newGameAddress,
      tag: tag,
      title: title,
      oracleAddr: oracleAddr,
      resolveTime: resolveTime,
      threshold: threshold,
      totalAmount: 0,
      betYesAmount: 0,
      betNoAmount: 0,
      ongoing: true,
      gameOutcome: 0
    });

    gameAddr2Id[newGameAddress] = gameCount;

    ongoingGamesId2Idx[gameCount] = ongoingGamesCnt;
    ongoingGames.push(gameContractRegistry[gameCount]);

    ongoingGamesCnt = SafeMath.add(ongoingGamesCnt, 1);
    gameCount = SafeMath.add(gameCount, 1);

    emit GameCreated(gameContractRegistry[gameCount]);

    return newGameAddress;
  }

  function getGameCount() public view returns (uint256) {
    return gameCount-1; // [1, gameCount)
  }

  // Fetches all games with id from X to Y, (bounds inclusve)
  // note: even if the game doesn't exist, a game object would still be returned with default values filled
  function getXtoYGame(uint256 X, uint256 Y) public view returns (GameMetadata[] memory) {
    require(X <= Y, "X cannot be greater than Y");

    GameMetadata[] memory res = new GameMetadata[](Y-X+1);
    for (uint256 j=X; j<=Y; j++) {
      res[j-X] = gameContractRegistry[j];
    }

    return res;
  }

  // fetches all games
  function getAllGames() public view returns (GameMetadata[] memory) {
    GameMetadata[] memory res = new GameMetadata[](gameCount-1);
    for (uint256 j=1; j<=gameCount; j++) {
      res[j-1] = gameContractRegistry[j-1];
    }

    return res;
  }

  // fetches all ongoing games
  function getAllOngoingGames() external view returns (GameMetadata[] memory) {
    return ongoingGames;
  }

  modifier isExistingGame(bool mustBeGame) {
    if (mustBeGame) {
      require(
        gameAddr2Id[msg.sender] != 0,
        "not a recognised game"
      );
    }
    _;
  }

  // callable only by the game itself
  // A player joined the game on a particular side
  function playerJoinedSide(address player, uint8 betSide, uint256 amount, uint256 timestamp) external isExistingGame(true) {
    address gameAddr = msg.sender;
    uint256 gameId = gameAddr2Id[gameAddr];
    GameMetadata memory gameMetadata = gameContractRegistry[gameId];
    gameMetadata.totalAmount += amount;
    if (betSide == 2) {
      gameMetadata.betNoAmount += amount;
    } else {
      gameMetadata.betYesAmount += amount;
    }
    
    playerExistingPositions[player][gameId][betSide] += amount;
    // for simplicity, we do not merge the bets, even if they are for the same game and on the same side
    // they exist as 2 separate trx with their own unique ids
    ongoingBetsTrxId2Idx[trxId] = ongoingBetsSize[player];
    ongoingBets[player].push(BetInfo({trxId: trxId, gameId: gameId, betSide: betSide, amt: amount, betOutcome: 0}));
    ongoingBetsSize[player] = SafeMath.add(ongoingBetsSize[player], 1);

    // record this activity as well
    playersRecords[player].push(Activity({
      trxId: trxId,
      activityType: BetActivityType,
      gameId: gameId,
      trxAmt: amount,
      trxTime: timestamp,
      gameSide: betSide,
      from: address(this),
      to: player
    }));

    trxId = SafeMath.add(trxId, 1);

    emit PlayerJoinedGameEvent(player, gameId, gameAddr, betSide, amount);
  }

  function concludeGame(uint8 gameOutcome) external isExistingGame(true) {
    address gameAddr = msg.sender;
    uint256 gameId = gameAddr2Id[gameAddr];

    // move game out of existing ongoing games
    uint256 existingGameIdx = ongoingGamesId2Idx[gameId];
    GameMetadata memory finisedGame = ongoingGames[existingGameIdx];
    GameMetadata memory lastOngoingGame = ongoingGames[SafeMath.sub(ongoingGamesCnt, 1)];
    ongoingGamesId2Idx[lastOngoingGame.id] = existingGameIdx;
    delete ongoingGamesId2Idx[gameId];
    ongoingGames[existingGameIdx] = lastOngoingGame;
    ongoingGamesCnt = SafeMath.sub(ongoingGamesCnt, 1);

    // update metadata for the game
    finisedGame.ongoing = false;
    finisedGame.gameOutcome = gameOutcome;

    gameContractRegistry[finisedGame.id].ongoing = false;
    gameContractRegistry[finisedGame.id].gameOutcome = gameOutcome;

    // add this game to array of closedGames
    closedGames.push(finisedGame);

    emit GameConcluded(gameId, gameAddr, gameOutcome);
  }

  struct PlayerTrx {
    // ongoing bets
    BetInfo[] ongoingBets;

    // pending win claims, games that have closed and player should withdraw his/her winnings
    BetInfo[] winningsPending;

    // concluded bets, wins and loses
    BetInfo[] historicalBets;
  }

  // given an address, identify all the existing bets opened
  function queryAllPlayersTrx(address player) external view returns (PlayerTrx memory) {
    return PlayerTrx({
      ongoingBets: ongoingBets[player],
      winningsPending: pendingWins[player],
      historicalBets: historicalBets[player]
    });
  }

  // callable only by the game itself
  // A player gave his side to someone else
  function playersSwapSide() external isExistingGame(true) {
    // TODO: update the mappings to the latest game state
    // address gameAddr = msg.sender;

  }

  // @notice Will receive any eth sent to the contract
  receive() external payable {
  }
}
