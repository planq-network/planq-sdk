pragma solidity ^0.8.0;

import "./TestParent.sol";

contract TestContract is TestParent {
  uint256 public constant INSERTED_CONSTANT = 42;

  struct Thing {
    uint128 a;
    uint128 b;
    uint128 c;
  }

  uint256 public x;
  address public z;

  Thing public thing;
}
