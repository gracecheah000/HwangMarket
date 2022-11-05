// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

import "./Models.sol";

library IterableMapping {
  struct ListingsMap {
    uint[] keys;
    mapping(uint => Models.ListingInfo) values;
    mapping(uint => uint) indexOf;
    mapping(uint => bool) inserted;
    Models.ListingInfo[] listingValues;
  }

  function contains(ListingsMap storage map, uint key) public view returns(bool) {
    return map.inserted[key];
  }

  function get(ListingsMap storage map, uint key) public view returns (Models.ListingInfo memory) {
      return map.values[key];
  }

  function getKeyAtIndex(ListingsMap storage map, uint index) public view returns (uint) {
      return map.keys[index];
  }

  function size(ListingsMap storage map) public view returns (uint) {
      return map.keys.length;
  }

  function getlistingValues(ListingsMap storage map) public view returns (Models.ListingInfo[] memory) {
    return map.listingValues;
  }

  function set(
    ListingsMap storage map,
    uint key,
    Models.ListingInfo memory val
  ) public {
    if (map.inserted[key]) {
        map.values[key] = val;
        map.listingValues[map.indexOf[key]] = val;
    } else {
        map.inserted[key] = true;
        map.values[key] = val;
        map.indexOf[key] = map.keys.length;
        map.keys.push(key);
        map.listingValues.push(val);
    }
  }

  function remove(ListingsMap storage map, uint key) public {
    if (!map.inserted[key]) {
        return;
    }

    delete map.inserted[key];
    delete map.values[key];

    uint index = map.indexOf[key];
    uint lastIndex = map.keys.length - 1;
    uint lastKey = map.keys[lastIndex];

    map.indexOf[lastKey] = index;
    delete map.indexOf[key];

    map.keys[index] = lastKey;
    map.keys.pop();
    map.listingValues[index] = map.listingValues[lastIndex];
    map.listingValues.pop();
  }
}