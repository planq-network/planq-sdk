pragma solidity ^0.5.13;

interface IReserve {
    function setTobinTaxStalenessThreshold(uint256) external;

    function addToken(address) external returns (bool);

    function removeToken(address, uint256) external returns (bool);

    function transferPlanq(address payable, uint256) external returns (bool);

    function transferExchangePlanq(address payable, uint256) external returns (bool);

    function getReservePlanqBalance() external view returns (uint256);

    function getUnfrozenReservePlanqBalance() external view returns (uint256);

    function getOrComputeTobinTax() external returns (uint256, uint256);

    function getTokens() external view returns (address[] memory);

    function getReserveRatio() external view returns (uint256);

    function addExchangeSpender(address) external;

    function removeExchangeSpender(address, uint256) external;

    function addSpender(address) external;

    function removeSpender(address) external;
}
