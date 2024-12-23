pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./TestLibrary.sol";

contract TestParent is Ownable {
  using TestLibrary for TestLibrary.Thing;

  uint256 private p;
  address private q;

  TestLibrary.Thing libraryThing;
}
