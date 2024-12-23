pragma solidity ^0.8.0;

interface IGovernance {
    function isVoting(address) external view returns (bool);
    function getAmountOfPlanqUsedForVoting(address account)
        external
        view
        returns (uint256);
}
