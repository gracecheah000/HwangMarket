// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./MainToken.sol";
import "./GameContract.sol";
import "./IterableMapping.sol";
import "./Models.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract HwangMarket {
  using IterableMapping for IterableMapping.ListingsMap;
  using SafeMath for uint256;
  address public mainTokenAddress;
  MainToken public mainToken;

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

  // Activity types constant
  string constant BetActivityType = "BET";
  string constant SellActivityType = "SELL";
  string constant WithdrawActivityType = "WITHDRAW";

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

  IterableMapping.ListingsMap private listingContracts;
  uint256 public listingsCount;
  

  constructor() {
    // we start counting from game 1, game id 0 is nonsense since its also default value
    gameCount = 1;

    mainToken = new MainToken();
    mainTokenAddress = address(mainToken);
  }

  event GameCreated(GameMetadata gameMetadata);
  event PlayerJoinedGameEvent(address player, uint256 gameId, address gameAddr, uint8 betSide, uint256 amount);
  event PlayerWithdrawedWinnings(address player, uint256 gameId, address gameAddr, uint8 betSide, uint256 withdrawedAmt);
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

  // creates a new listing
  function newListing(address _player, address token1, uint256 token1Amt, address token2, uint256 token2Amt) public returns(Models.ListingInfo memory) {
    uint256 newListingId = listingsCount;
    ListingContract newListingContract = new ListingContract(newListingId, _player, token1, token1Amt, token2, token2Amt);
    Models.ListingInfo memory listingInfo = Models.ListingInfo({
      listingId: newListingId,
      listingAddr: address(newListingContract),
      player1: _player,
      token1: token1,
      token1Amt: token1Amt,
      player2: address(0),
      token2: token2,
      token2Amt: token2Amt,
      fulfilled: false
    });
    listingContracts.set(newListingId, listingInfo);

    listingsCount++;
    return listingInfo;
  }

  function getListingContractAddressById(uint listingId) external view returns(address) {
    return listingContracts.get(listingId).listingAddr;
  }

  function getAllListings() external view returns (Models.ListingInfo[] memory) {
    return listingContracts.getlistingValues();
  }

  // player joins an existing listing already posted by another player
  // this player joining now is regarded as player2 under the listing contract
  function partakeInListing(address _player, uint listingId) public {
    require(listingContracts.contains(listingId), "listing contract does not exist");
    address listingAddr = listingContracts.get(listingId).listingAddr;
    ListingContract token2Contract = ListingContract(listingAddr);
    token2Contract.trigger(_player);
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

    // record this activity as well
    playersRecords[player].push(Activity({
      trxId: trxId,
      activityType: BetActivityType,
      gameId: gameId,
      trxAmt: amount,
      trxTime: timestamp,
      gameSide: betSide,
      from: player,
      to: gameAddr
    }));

    trxId = SafeMath.add(trxId, 1);

    emit PlayerJoinedGameEvent(player, gameId, gameAddr, betSide, amount);
  }

  // callable only by contract
  // note: withdraw winnings means recording player's owned game tokens -> hwang market tokens
  function playerWithdrawWinnings(address _player, uint8 betSide, uint256 withdrawAmt, uint256 timestamp) external isExistingGame(true) {
    address gameAddr = msg.sender;
    uint256 gameId = gameAddr2Id[gameAddr];
    playersRecords[_player].push(Activity({
      trxId: trxId,
      activityType: WithdrawActivityType,
      gameId: gameId,
      trxAmt: withdrawAmt,
      trxTime: timestamp,
      gameSide: betSide,
      from: gameAddr,
      to: _player
    }));

    trxId = SafeMath.add(trxId, 1);

    emit PlayerWithdrawedWinnings(_player, gameId, gameAddr, betSide, withdrawAmt);
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

    // // update metadata for the game
    finisedGame.ongoing = false;
    finisedGame.gameOutcome = gameOutcome;

    gameContractRegistry[finisedGame.id].ongoing = false;
    gameContractRegistry[finisedGame.id].gameOutcome = gameOutcome;

    // add this game to array of closedGames
    closedGames.push(finisedGame);

    emit GameConcluded(gameId, gameAddr, gameOutcome);
  }

  // callable only by the game itself
  // A player gave his side to someone else
  function playersSwapSide() external isExistingGame(true) {
    // TODO: update the mappings to the latest game state
    // address gameAddr = msg.sender;

  }

  // to get smart contract's balance
  function getBalance() public view returns (uint256) {
    return address(this).balance;
  }

  // @notice Will receive any eth sent to the contract
  receive() external payable {
  }
}
