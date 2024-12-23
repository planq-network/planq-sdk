pragma solidity ^0.8.0;

import "../EpochRewards.sol";

/**
 * @title A wrapper around EpochRewards that exposes internal functions for testing.
 */
contract EpochRewardsTest is EpochRewards(true) {
    uint256 private numValidatorsInCurrentSet;
    function getRewardsMultiplier(uint256 targetPlanqTotalSupplyIncrease)
        external
        view
        returns (uint256)
    {
        return _getRewardsMultiplier(targetPlanqTotalSupplyIncrease).unwrap();
    }

    function updateTargetVotingYield() external {
        _updateTargetVotingYield();
    }

    function numberValidatorsInCurrentSet() public view returns (uint256) {
        return numValidatorsInCurrentSet;
    }

    function setNumberValidatorsInCurrentSet(uint256 value) external {
        numValidatorsInCurrentSet = value;
    }
}
