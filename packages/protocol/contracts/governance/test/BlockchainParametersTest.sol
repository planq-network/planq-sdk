pragma solidity ^0.8.0;

import "../BlockchainParameters.sol";
import "./MockUsingPrecompiles.sol";

contract BlockchainParametersTest is
    BlockchainParameters(true),
    MockUsingPrecompiles
{}
