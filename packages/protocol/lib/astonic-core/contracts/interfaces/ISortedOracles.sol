pragma solidity ^0.5.13;

interface ISortedOracles {
    function addOracle(address, address) external;

    function removeOracle(
        address,
        address,
        uint256
    ) external;

    function report(
        address,
        uint256,
        address,
        address
    ) external;

    function removeExpiredReports(address, uint256) external;

    function isOldestReportExpired(address token) external view returns (bool, address);

    function numRates(address) external view returns (uint256);

    function medianRate(address) external view returns (uint256, uint256);

    function numTimestamps(address) external view returns (uint256);

    function medianTimestamp(address) external view returns (uint256);
}
