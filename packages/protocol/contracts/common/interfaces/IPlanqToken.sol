pragma solidity ^0.5.13;

/**
 * @title This interface describes the non- ERC20 shared interface for all Planq Tokens, and
 * in the absence of interface inheritance is intended as a companion to IERC20.sol.
 */
interface IPlanqToken {
    function transferWithComment(address, uint256, string calldata)
        external
        returns (bool);
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function burn(uint256 value) external returns (bool);
}
