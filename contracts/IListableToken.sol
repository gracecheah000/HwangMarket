// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

import "./Models.sol";

/*
  To list tokens up on the site, we require tokens to follow the following interface, with the following methods.
  However, it is still possible to perform token listing with the standard approve and transfer IERC20 token interface,
  just that it cannot be done via the UI which will expect these methods to be implemented on the token contract.
  */
interface IListableToken {
  function acceptTokenExchange(address listingAddress) external returns (Models.ListingInfo memory);
}