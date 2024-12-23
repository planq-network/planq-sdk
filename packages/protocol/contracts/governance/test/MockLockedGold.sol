pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "../interfaces/ILockedPlanq.sol";

/**
 * @title A mock LockedPlanq for testing.
 */
contract MockLockedPlanq is ILockedPlanq {
    using SafeMath for uint256;

    struct Authorizations {
        address validator;
        address voter;
    }

    mapping(address => uint256) public accountTotalLockedPlanq;
    mapping(address => uint256) public nonvotingAccountBalance;
    mapping(address => address) public authorizedValidators;
    mapping(address => address) public authorizedBy;
    uint256 private totalLockedPlanq;
    mapping(address => bool) public slashingWhitelist;

    function incrementNonvotingAccountBalance(address account, uint256 value)
        external
    {
        nonvotingAccountBalance[account] = nonvotingAccountBalance[account].add(
            value
        );
    }

    function decrementNonvotingAccountBalance(address account, uint256 value)
        public
    {
        nonvotingAccountBalance[account] = nonvotingAccountBalance[account].sub(
            value
        );
    }

    function setAccountTotalLockedPlanq(address account, uint256 value)
        external
    {
        accountTotalLockedPlanq[account] = value;
    }

    function getAccountTotalLockedPlanq(address account)
        external
        view
        returns (uint256)
    {
        return accountTotalLockedPlanq[account];
    }

    function setTotalLockedPlanq(uint256 value) external {
        totalLockedPlanq = value;
    }
    function getTotalLockedPlanq() external view returns (uint256) {
        return totalLockedPlanq;
    }

    function lock() external payable {
        accountTotalLockedPlanq[msg.sender] = accountTotalLockedPlanq[msg
            .sender]
            .add(msg.value);
    }

    function unlock(uint256 value) external {
        accountTotalLockedPlanq[msg.sender] = accountTotalLockedPlanq[msg
            .sender]
            .sub(value);
    }

    function relock(uint256 index, uint256 value) external {
        // TODO: add implementation if necessary to mock behaviour
    }

    function withdraw(uint256 index) external {
        // TODO: add implementation if necessary to mock behaviour
    }

    function slash(
        address account,
        uint256 penalty,
        address,
        uint256,
        address[] calldata,
        address[] calldata,
        uint256[] calldata
    ) external {
        accountTotalLockedPlanq[account] = accountTotalLockedPlanq[account].sub(
            penalty
        );
    }
    function addSlasher(address slasher) external {
        slashingWhitelist[slasher] = true;
    }
    function removeSlasher(address slasher) external {
        slashingWhitelist[slasher] = false;
    }
    function isSlasher(address slasher) external view returns (bool) {
        return slashingWhitelist[slasher];
    }

    function getPendingWithdrawals(address)
        external
        view
        returns (uint256[] memory, uint256[] memory)
    {
        uint256[] memory empty = new uint256[](0);
        return (empty, empty);
    }

    function getTotalPendingWithdrawals(address)
        external
        view
        returns (uint256)
    {
        return 0;
    }
}
