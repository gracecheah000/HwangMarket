// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./IListingOwner.sol";
import "./Models.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// listing contract is effectively an IERC20 token swap contract, 
// with both parties required to trust it, 
// by already preapproving it as a spender for the corresponding amount
contract ListingContract {
  address public creator;
  uint256 public listingId;
  uint256 public createdTime;
  uint256 public newListingContract;
  address public player1;
  address public token1;
  IERC20 public token1Contract;
  uint256 public token1Amt;

  address public player2;
  address public token2;
  IERC20 public token2Contract;
  uint256 public token2Amt;

  bool public fulfilled;

  constructor(uint256 _listingId, address _player, address _token1, uint256 _token1Amt, address _token2, uint256 _token2Amt) {
    creator = msg.sender;
    listingId = _listingId;
    createdTime = block.timestamp;
    player1 = _player;
    token1 = _token1;
    token1Amt = _token1Amt;
    token2 = _token2;
    token2Amt = _token2Amt;

    token1Contract = IERC20(_token1);
    require(token1Contract.balanceOf(_player) >= _token1Amt, "player 1 has insufficient balance of token 1 to create a listing");
    token2Contract = IERC20(_token2);
    
    fulfilled = false;
  }

  // trigger means when there is a suitable player 2, offering up the asked amount of token2 
  // to execute the trade
  function trigger(address _player2) external returns (Models.ListingInfo memory) {
    require(
      token1Contract.allowance(player1, address(this)) >= token1Amt,
      "Token 1 allowance too low"
    );
    require(
      token2Contract.allowance(_player2, address(this)) >= token2Amt,
      "Token 2 allowance too low"
    );

    _safeTransferFrom(token1Contract, player1, _player2, token1Amt);
    _safeTransferFrom(token2Contract, _player2, player1, token2Amt);
    player2 = _player2;
    fulfilled = true;

    Models.ListingInfo memory listingInfo = Models.ListingInfo({
      listingId: listingId,
      createdTime: createdTime,
      listingAddr: address(this),
      player1: player1,
      token1: token1,
      token1Amt: token1Amt,
      player2: player2,
      token2: token2,
      token2Amt: token2Amt,
      fulfilled: fulfilled,
      fulfilledTime: block.timestamp
    });
    IListingOwner(creator).updateListing(listingInfo);

    return listingInfo;
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