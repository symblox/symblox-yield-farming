pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import "../Governor.sol";

contract MockGovernor is Governor {
    function votingDelay() public pure returns (uint256) {
        return 1;
    }

    function quorumVotes() public view returns (uint256) {
        return syx.totalSupply().mul(4e14).div(1e18);
    } // 0.04% of syx

    function proposalThreshold() public view returns (uint256) {
        return syx.totalSupply().mul(1e14).div(1e18);
    } // 0.01% of syx

    constructor(
        address syx_,
        address guardian_,
        uint256 votingPeriod_
    ) public Governor(syx_, guardian_, votingPeriod_) {
        votingPeriod = votingPeriod_;
    }
}
