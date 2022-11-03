// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./MainToken.sol";
import "./GameContract.sol";
import "./GameContractFactory.sol";
import "./Models.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract HwangMarket {
  using SafeMath for uint256;
  address public mainTokenAddress;

  // game contract factory is used to reduce contract build size :(
  GameContractFactory gameFactory;

  // for all activity
  uint256 private trxId;

  // for all games created
  uint256 private gameCount;
  mapping(uint256 => address) public gameId2Addr;
  mapping(address => uint256) public gameAddr2Id;
  
  // for all ongoing games
  uint256 private ongoingGamesCnt; // record end of ongoing games array
  address[] public ongoingGames;
  mapping(uint256 => int256) ongoingGamesId2Idx;

  // for all closed games
  address[] public closedGames;

  // Activity types constant
  string constant BetActivityType = "BET";
  string constant WithdrawActivityType = "WITHDRAW";

  mapping(address => Models.Activity[]) public playersRecords;

  constructor(address mainTokenAddr, address gameContractFactoryAddr) {
    // we start counting from game 1, game id 0 is nonsense since its also default value
    gameCount = 1;
    mainTokenAddress = mainTokenAddr;
    gameFactory = GameContractFactory(gameContractFactoryAddr);
  }

  event GameCreated(Models.GameMetadata gameMetadata);
  event PlayerJoinedGameEvent(address player, uint256 gameId, address gameAddr, uint8 betSide, uint256 amount);
  event PlayerWithdrawedWinnings(address player, uint256 gameId, address gameAddr, uint8 betSide, uint256 withdrawedAmt);
  event GameConcluded(uint256 gameId, address gameAddr, uint8 gameOutcome);
  event NewListing(Models.ListingInfo listingInfo);
  event ListingFulfilled(Models.ListingInfo listingInfo);

  // create game contract instance
  function createGame(uint256 resolveTime, address oracleAddr, int256 threshold, string memory tag, string memory title) external {
    GameContract newGame = gameFactory.createGame(address(this), resolveTime, oracleAddr, threshold, tag, title, gameCount); 
    address newGameAddress = address(newGame);
    gameId2Addr[gameCount] = newGameAddress;
    gameAddr2Id[newGameAddress] = gameCount;

    ongoingGamesId2Idx[gameCount] = int256(ongoingGamesCnt);
    ongoingGames.push(newGameAddress);

    ongoingGamesCnt = SafeMath.add(ongoingGamesCnt, 1);

    emit GameCreated(newGame.getGameInfo());

    gameCount = SafeMath.add(gameCount, 1);
  }
  
  // fetches all games
  function getAllGames() public view returns (Models.AllGames memory) {
    return Models.AllGames({ongoingGames: ongoingGames, closedGames: closedGames});
  }

  // callable only by the game itself
  // A player joined the game on a particular side
  function playerJoinedSide(address player, uint8 betSide, uint256 amount, uint256 timestamp) external {
    require(gameAddr2Id[msg.sender] != 0 && ongoingGamesId2Idx[gameAddr2Id[msg.sender]] != -1);
    address gameAddr = msg.sender;
    uint256 gameId = gameAddr2Id[gameAddr];

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
    address finishedGameAddress = ongoingGames[existingGameIdx];
    address lastOngoingGameAddress = ongoingGames[SafeMath.sub(ongoingGamesCnt, 1)];
    ongoingGamesId2Idx[gameAddr2Id[lastOngoingGameAddress]] = int256(existingGameIdx);
    ongoingGamesId2Idx[gameId] = -1;
    ongoingGames[existingGameIdx] = lastOngoingGameAddress;
    ongoingGamesCnt = SafeMath.sub(ongoingGamesCnt, 1);

    // add this game to array of closedGames
    closedGames.push(finishedGameAddress);
    ongoingGames.pop();

    emit GameConcluded(gameId, gameAddr, gameOutcome);
  }

  function getPlayersTrxRecords(address player) public view returns (Models.Activity[] memory) {
    return playersRecords[player];
  }

  function checkAllOngoingGamesUpkeep() external {
    for (uint256 i=0; i<ongoingGamesCnt; i++) {
      GameContract(ongoingGames[i]).performUpkeep();
    }
  }
}
