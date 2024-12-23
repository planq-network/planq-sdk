pragma solidity ^0.8.0;

contract CalledByVm {
    modifier onlyVm() {
        require(msg.sender == address(0), "Only VM can call");
        _;
    }
}
