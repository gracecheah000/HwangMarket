// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

library IterableMapping {
    // Iterable mapping from uint to address;
    struct Map {
      uint[] keys;
      mapping(uint => address) values;
      mapping(uint => uint) indexOf;
      mapping(uint => bool) inserted;
    }

    function get(Map storage map, uint key) public view returns (address) {
        return map.values[key];
    }

    function getKeyAtIndex(Map storage map, uint index) public view returns (uint) {
        return map.keys[index];
    }

    function size(Map storage map) public view returns (uint) {
        return map.keys.length;
    }

    function set(
        Map storage map,
        uint key,
        address val
    ) public {
        if (map.inserted[key]) {
            map.values[key] = val;
        } else {
            map.inserted[key] = true;
            map.values[key] = val;
            map.indexOf[key] = map.keys.length;
            map.keys.push(key);
        }
    }

    function remove(Map storage map, uint key) public returns (address) {
      if (!map.inserted[key]) {
          return address(0);
      }
      address removed = map.values[key];

      delete map.inserted[key];
      delete map.values[key];

      uint index = map.indexOf[key];
      uint lastIndex = map.keys.length - 1;
      uint lastKey = map.keys[lastIndex];

      map.indexOf[lastKey] = index;
      delete map.indexOf[key];

      map.keys[index] = lastKey;
      map.keys.pop();

      return removed;
    }
}
