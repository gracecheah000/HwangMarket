// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./ListingContract.sol";
import "./IListingOwner.sol";
import "./Models.sol";
import "./HwangMarket.sol";
import "./IterableMapping.sol";
import "./GameERC20Token.sol";
import "./GameERC20TokenFactory.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract GameContract is IListingOwner {
  using SafeMath for uint256;
  using IterableMapping for IterableMapping.ListingsMap;

  address public hwangMarketAddr; 
  Models.GameMetadata public gameInfo;

  AggregatorV3Interface internal priceFeed;

  // Trx types constant
  string constant BetActivityType = "BET";
  string constant WithdrawActivityType = "WITHDRAW";

  // conversion rate from 1 HMTKN to 1 Game Token
  uint constant mainTkn2GameTknConversionRate = 1;
  uint constant supplyLimit = 1000;

  Models.Trx[] trxs;
  uint256 internal trxId;

  address public gameNoTokenContractAddress;
  address public gameYesTokenContractAddress;

  IterableMapping.ListingsMap private listingContracts;
  uint256 public listingsCount;

  event NewListing(Models.ListingInfo listingInfo);
  event ListingFulfilled(Models.ListingInfo listingInfo);

  // constructor takes in a resolve time, a oracleAddr (oracle address), and a threshold, 
  // where a gameSide of NO indicates < threshold, and a gameSide of YES indicates >= threshold
  constructor(address hmAddr , uint256 _resolveTime, address _oracleAddr, int256 thres, string memory _tag, string memory _title, uint256 _id, address gytAddr, address gntAddr) {
    hwangMarketAddr = hmAddr;
    priceFeed = AggregatorV3Interface(_oracleAddr);
    gameInfo = Models.GameMetadata({
      id: _id,
      createdTime: block.timestamp,
      addr: address(this),
      tag: _tag,
      title: _title,
      oracleAddr: _oracleAddr,
      resolveTime: _resolveTime,
      threshold: thres,
      totalAmount: 0,
      betYesAmount: 0,
      betNoAmount: 0,
      gameOutcome: 0
    });

    // every game contract deploys 2 IERC20 token contracts
    // yes and no tokens
    gameNoTokenContractAddress = gntAddr;
    gameYesTokenContractAddress = gytAddr;
  }

  // creates a new listing
  function newListing(address _player, uint256 token1Amt, address token2, uint256 token2Amt) public returns(Models.ListingInfo memory) {
    require(msg.sender == gameNoTokenContractAddress || msg.sender == gameYesTokenContractAddress, "only game token can create new listings");
    uint256 newListingId = listingsCount;
    ListingContract newListingContract = new ListingContract(newListingId, _player, msg.sender, token1Amt, token2, token2Amt);
    Models.ListingInfo memory listingInfo = Models.ListingInfo({
      listingId: newListingId,
      listingAddr: address(newListingContract),
      player1: _player,
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

  function getListingContractAddressById(uint listingId) external view returns(address) {
    return listingContracts.get(listingId).listingAddr;
  }

  function getGameInfo() external view returns (Models.GameMetadata memory) {
    return gameInfo;
  }

  function getAllListings() external view returns (Models.ListingInfo[] memory) {
    return listingContracts.getlistingValues();
  }

  function updateListing(Models.ListingInfo memory listingInfo) public {
    listingContracts.set(listingInfo.listingId, listingInfo);

    emit ListingFulfilled(listingInfo);
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

  // payable keyword should allow depositing of ethereum into smart contract
  // allow msg.sender address to register as a player
  function addPlayer(address _player, uint256 hwangMktTokenAmt, uint8 betSide) public {
      require(gameInfo.gameOutcome == 0, "Game is closed, no further bets accepted");
      require(betSide == 1 || betSide == 2, "bet side is not recognised");
      require(block.timestamp <= gameInfo.resolveTime, "cannot put bets after resolve time");

      GameERC20Token gameTokenContract = GameERC20Token(gameNoTokenContractAddress);
      if (betSide == 1) {
        gameTokenContract = GameERC20Token(gameYesTokenContractAddress);
      }
      uint256 requestedMintAmt = hwangMktTokenAmt * mainTkn2GameTknConversionRate;
      // mint the respective 1-1 game token to the player
      gameTokenContract.mint(_player, requestedMintAmt);
      // collect the player's main token, deposit under the game address
      HwangMarket hm = HwangMarket(hwangMarketAddr);
      _safeTransferFrom(IERC20(hm.mainTokenAddress()), _player, address(this), hwangMktTokenAmt);

      // book keeping
      if (betSide == 1) {
        gameInfo.betYesAmount += hwangMktTokenAmt;
      } else {
        gameInfo.betNoAmount += hwangMktTokenAmt;
      }
      uint256 timestamp = block.timestamp;
      trxs.push(Models.Trx({
        trxId: trxId,
        activityType: BetActivityType,
        gameSide: betSide,
        trxAmt: hwangMktTokenAmt,
        trxTime: timestamp,
        from: address(this),
        to: _player
      }));
      trxId++;

      hm.playerJoinedSide(_player, betSide, hwangMktTokenAmt, timestamp);
    }

  // impt: anyone can call the contract to perform upkeep but it has a guard to protect against early resolves
  // and it checks against a "trusted" oracle chainlink to fetch the result
  function performUpkeep() public {
    if (block.timestamp < gameInfo.resolveTime || gameInfo.gameOutcome != 0) {
      return;
    }

    uint8 rawSide = 2;
    if (getLatestPrice() >= gameInfo.threshold) {
      rawSide = 1;
    }
    gameInfo.gameOutcome = rawSide;

    HwangMarket(hwangMarketAddr).concludeGame(rawSide);
  }

  // allow winners to withdraw their winnings in term of HMTKN
  function withdrawWinnings(uint withdrawAmt) public {
    require(gameInfo.gameOutcome != 0, "game outcome cannot be unknown"); // game outcome cannot be unknown
    IERC20 gameTokenContract = IERC20(gameNoTokenContractAddress);
    if (gameInfo.gameOutcome == 1) {
      gameTokenContract = IERC20(gameYesTokenContractAddress);
    }
    require(gameTokenContract.allowance(msg.sender, address(this)) >= withdrawAmt, "player must approve withdraw amount");
    require(gameTokenContract.balanceOf(msg.sender) >= withdrawAmt, "player must have game token amount to withdraw");

    // where to calculate amount of winnings
    // calculated winnings = (player's bet amount / total bet amount on winning side) * total bet amount on losing side
    uint256 amtOnWinning = gameInfo.betNoAmount;
    uint256 amtOnLosing = gameInfo.betYesAmount;
    if (gameInfo.gameOutcome == 1) {
      amtOnWinning = gameInfo.betYesAmount;
      amtOnLosing = gameInfo.betNoAmount;
    }
    uint256 deposit = (1 / mainTkn2GameTknConversionRate) * withdrawAmt;
    uint256 winnings = ((deposit / amtOnWinning) * amtOnLosing) + deposit;

    // initiate transfer of hwang market tokens from game to player
    IERC20(HwangMarket(hwangMarketAddr).mainTokenAddress()).transfer(msg.sender, winnings);
    // initiate transfer of game token from player back to game
    _safeTransferFrom(gameTokenContract, msg.sender, address(this), withdrawAmt);

    uint256 timestamp = block.timestamp;
    trxs.push(Models.Trx({
      trxId: trxId,
      activityType: WithdrawActivityType,
      gameSide: gameInfo.gameOutcome,
      trxAmt: winnings,
      trxTime: timestamp,
      from: address(this),
      to: msg.sender
    }));
    trxId++;
    HwangMarket(hwangMarketAddr).playerWithdrawWinnings(msg.sender, gameInfo.gameOutcome, winnings, timestamp);
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
