pragma solidity ^0.8.0;

import "../DowntimeSlasher.sol";
import "./MockUsingPrecompiles.sol";

contract DowntimeSlasherTest is DowntimeSlasher(true), MockUsingPrecompiles {}
