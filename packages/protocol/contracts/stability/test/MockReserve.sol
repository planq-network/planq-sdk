pragma solidity ^0.5.13;
// solhint-disable no-unused-vars

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

/**
 * @title A mock Reserve for testing.
 */
contract MockReserve {
  mapping(address => bool) public tokens;

  IERC20 public planqToken;

  // solhint-disable-next-line no-empty-blocks
  function() external payable {}

  function setPlanqToken(address planqTokenAddress) external {
    planqToken = IERC20(planqTokenAddress);
  }

  function transferPlanq(address to, uint256 value) external returns (bool) {
    require(planqToken.transfer(to, value), "planq token transfer failed");
    return true;
  }

  function transferExchangePlanq(address to, uint256 value) external returns (bool) {
    require(planqToken.transfer(to, value), "planq token transfer failed");
    return true;
  }

  function addToken(address token) external returns (bool) {
    tokens[token] = true;
    return true;
  }

  function burnToken(address) external pure returns (bool) {
    return true;
  }

  function getUnfrozenReservePlanqBalance() external view returns (uint256) {
    return address(this).balance;
  }
}
