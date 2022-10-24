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
}