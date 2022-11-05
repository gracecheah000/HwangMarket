// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

library Models {
  struct ListingInfo {
    uint256 listingId;
    address listingAddr;
    address player1;
    address token1;
    uint256 token1Amt;
    address player2;
    address token2;
    uint256 token2Amt;

    bool fulfilled;
  }

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

  struct GameMetadata {
    uint256 id;
    uint256 createdTime;
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

  struct AllGames {
    GameMetadata[] ongoingGames;
    GameMetadata[] closedGames;
  }

  struct TokenInfo {
    address tokenAddr;
    uint8 betSide;

    uint256 gameId;
    address gameAddr;
    string gameTag;
    string gameTitle;
    address gameOracleAddr;
    uint256 gameResolveTime;
    int256 gameThreshold;
  }
}