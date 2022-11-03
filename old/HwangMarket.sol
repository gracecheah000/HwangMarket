// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./MainToken.sol";
import "./IListingOwner.sol";
import "./GameContract.sol";
import "./GameContractFactory.sol";
import "./IterableMapping.sol";
import "./Models.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract HwangMarket is IListingOwner {
  using IterableMapping for IterableMapping.ListingsMap;
  using SafeMath for uint256;
  address public mainTokenAddress;
  MainToken public mainToken;

  // game contract factory is used to reduce contract build size :(
  GameContractFactory gameFactory;

  // for all activity
  uint256 private trxId;

  // for all games created
  uint256 private gameCount;
  mapping(uint256 => Models.GameMetadata) public gameContractRegistry;
  mapping(address => uint256) public gameAddr2Id;
  
  // for all ongoing games
  uint256 private ongoingGamesCnt; // record end of ongoing games array
  Models.GameMetadata[] public ongoingGames;
  mapping(uint256 => int256) ongoingGamesId2Idx;

  // for all closed games
  Models.GameMetadata[] public closedGames;

  // Activity types constant
  string constant BetActivityType = "BET";
  string constant WithdrawActivityType = "WITHDRAW";

  mapping(address => Models.Activity[]) public playersRecords;

  IterableMapping.ListingsMap private listingContracts;
  uint256 public listingsCount;
  
  mapping(address => Models.TokenInfo) public gameTokensRegistry;
  constructor() {
    // we start counting from game 1, game id 0 is nonsense since its also default value
    gameCount = 1;
    mainToken = new MainToken();
    mainTokenAddress = address(mainToken);
    gameFactory = new GameContractFactory();
  }

  event GameCreated(Models.GameMetadata gameMetadata);
  event PlayerJoinedGameEvent(address player, uint256 gameId, address gameAddr, uint8 betSide, uint256 amount);
  event PlayerWithdrawedWinnings(address player, uint256 gameId, address gameAddr, uint8 betSide, uint256 withdrawedAmt);
  event GameConcluded(uint256 gameId, address gameAddr, uint8 gameOutcome);
  event NewListing(Models.ListingInfo listingInfo);
  event ListingFulfilled(Models.ListingInfo listingInfo);

  // create game contract instance
  function createGame(uint256 resolveTime, address oracleAddr, int256 threshold, string memory tag, string memory title) public returns (address) {
    GameContract newGame = gameFactory.createGame(address(this), resolveTime, oracleAddr, threshold); 
    address newGameAddress = address(newGame);
    gameContractRegistry[gameCount] = Models.GameMetadata({
      id: gameCount,
      createdTime: block.timestamp,
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
    gameTokensRegistry[newGame.gameYesTokenContractAddress()] = Models.TokenInfo({
      tokenAddr: newGame.gameYesTokenContractAddress(),
      betSide: 1,
      gameId: gameCount,
      gameAddr: newGameAddress,
      gameTag: tag,
      gameTitle: title,
      gameOracleAddr: oracleAddr,
      gameResolveTime: resolveTime,
      gameThreshold: threshold
    });
    gameTokensRegistry[newGame.gameNoTokenContractAddress()] = Models.TokenInfo({
      tokenAddr: newGame.gameNoTokenContractAddress(),
      betSide: 0,
      gameId: gameCount,
      gameAddr: newGameAddress,
      gameTag: tag,
      gameTitle: title,
      gameOracleAddr: oracleAddr,
      gameResolveTime: resolveTime,
      gameThreshold: threshold
    });

    gameAddr2Id[newGameAddress] = gameCount;

    ongoingGamesId2Idx[gameCount] = int256(ongoingGamesCnt);
    ongoingGames.push(gameContractRegistry[gameCount]);

    ongoingGamesCnt = SafeMath.add(ongoingGamesCnt, 1);

    emit GameCreated(gameContractRegistry[gameCount]);

    gameCount = SafeMath.add(gameCount, 1);
    return newGameAddress;
  }

  function getGameCount() public view returns (uint256) {
    return gameCount-1; // [1, gameCount)
  }

  
  // fetches all games
  function getAllGames() public view returns (Models.AllGames memory) {
    return Models.AllGames({ongoingGames: ongoingGames, closedGames: closedGames});
  }

  // creates a new listing, intended to be called by the IERC20 and IListableToken compliant token
  function newListing(address player, uint256 token1Amt, address token2, uint256 token2Amt) external returns (Models.ListingInfo memory) {
    require(msg.sender == mainTokenAddress, "only main token can call");
    uint256 newListingId = listingsCount;
    ListingContract newListingContract = new ListingContract(newListingId, player, msg.sender, token1Amt, token2, token2Amt);
    Models.ListingInfo memory listingInfo = Models.ListingInfo({
      listingId: newListingId,
      listingAddr: address(newListingContract),
      player1: player,
      token1: msg.sender,
      token1Amt: token1Amt,
      player2: address(0),
      token2: token2,
      token2Amt: token2Amt,
      fulfilled: false
    });
    listingContracts.set(newListingId, listingInfo);

    listingsCount++;
    emit NewListing(listingInfo);
    return listingInfo;
  }

  function getAllListings() external view returns (Models.ListingInfo[] memory) {
    return listingContracts.getlistingValues();
  }

  function updateListing(Models.ListingInfo memory listingInfo) public {
    listingContracts.set(listingInfo.listingId, listingInfo);

    emit ListingFulfilled(listingInfo);
  }


  // callable only by the game itself
  // A player joined the game on a particular side
  function playerJoinedSide(address player, uint8 betSide, uint256 amount, uint256 timestamp) external {
    require(gameAddr2Id[msg.sender] != 0 && ongoingGamesId2Idx[gameAddr2Id[msg.sender]] != -1);
    address gameAddr = msg.sender;
    uint256 gameId = gameAddr2Id[gameAddr];
    Models.GameMetadata storage game = gameContractRegistry[gameId];
    Models.GameMetadata storage ongoingGameRef = ongoingGames[uint256(ongoingGamesId2Idx[gameId])];
    game.totalAmount += amount;
    ongoingGameRef.totalAmount += amount;
    if (betSide == 2) {
      game.betNoAmount += amount;
      ongoingGameRef.betNoAmount += amount;
    } else {
      game.betYesAmount += amount;
      ongoingGameRef.betYesAmount += amount;
    }

    // record this activity as well
    playersRecords[player].push(Models.Activity({
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
  function playerWithdrawWinnings(address _player, uint8 betSide, uint256 withdrawAmt, uint256 timestamp) external {
    require(gameAddr2Id[msg.sender] != 0);
    address gameAddr = msg.sender;
    uint256 gameId = gameAddr2Id[gameAddr];
    playersRecords[_player].push(Models.Activity({
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

  function concludeGame(uint8 gameOutcome) external {
    require(gameAddr2Id[msg.sender] != 0);
    address gameAddr = msg.sender;
    uint256 gameId = gameAddr2Id[gameAddr];

    // move game out of existing ongoing games
    int256 temp = ongoingGamesId2Idx[gameId];
    if (temp == -1) { // already concluded
      return;
    }
    uint256 existingGameIdx = uint256(temp);
    Models.GameMetadata memory finisedGame = ongoingGames[existingGameIdx];
    Models.GameMetadata memory lastOngoingGame = ongoingGames[SafeMath.sub(ongoingGamesCnt, 1)];
    ongoingGamesId2Idx[lastOngoingGame.id] = int256(existingGameIdx);
    ongoingGamesId2Idx[gameId] = -1;
    ongoingGames[existingGameIdx] = lastOngoingGame;
    ongoingGamesCnt = SafeMath.sub(ongoingGamesCnt, 1);

    // // update metadata for the game
    finisedGame.ongoing = false;
    finisedGame.gameOutcome = gameOutcome;

    Models.GameMetadata storage g = gameContractRegistry[finisedGame.id];
    g.ongoing = false;
    g.gameOutcome = gameOutcome;

    // add this game to array of closedGames
    closedGames.push(finisedGame);
    ongoingGames.pop();

    emit GameConcluded(gameId, gameAddr, gameOutcome);
  }

  // to get smart contract's balance
  function getBalance() public view returns (uint256) {
    return address(this).balance;
  }

  function getPlayersTrxRecords(address player) public view returns (Models.Activity[] memory) {
    return playersRecords[player];
  }

  function checkAllOngoingGamesUpkeep() external {
    for (uint256 i=0; i<ongoingGamesCnt; i++) {
      Models.GameMetadata storage game = ongoingGames[i];
      GameContract gameContract = GameContract(game.addr);
      gameContract.performUpkeep();
    }
  }
}
