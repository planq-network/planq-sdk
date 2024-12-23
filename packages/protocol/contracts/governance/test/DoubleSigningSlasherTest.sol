pragma solidity ^0.8.0;

import "../DoubleSigningSlasher.sol";
import "./MockUsingPrecompiles.sol";

contract DoubleSigningSlasherTest is
    DoubleSigningSlasher(true),
    MockUsingPrecompiles
{}
