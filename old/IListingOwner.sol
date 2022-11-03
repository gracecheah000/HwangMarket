// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

import "./Models.sol";

interface IListingOwner {
  function updateListing(Models.ListingInfo memory listingInfo) external;
}