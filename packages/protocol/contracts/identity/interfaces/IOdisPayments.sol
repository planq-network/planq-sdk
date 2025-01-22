pragma solidity ^0.5.13;

interface IOdisPayments {
    function payInAUSD(address account, uint256 value) external;
    function totalPaidAUSD(address) external view returns (uint256);
}
