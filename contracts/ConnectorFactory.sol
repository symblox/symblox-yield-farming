pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/upgradeability/ProxyFactory.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

contract ConnectorFactory is ProxyFactory, Ownable {
    // ( reward pool id => connector implementation address )
    mapping(uint8 => address) public connectorImpls;
    // user address => ( reward pool id => connector address )
    mapping(address => mapping(uint8 => address)) public connectors;

    // use liquidity pool address to find the corresponding reward pool
    address public rewardManager;

    event LogCreateConnector(address indexed caller, address connector);
    event LogSetImplementation(uint8 indexed pid, address implementation);

    constructor(address _rewardManager) public {
        require(_rewardManager != address(0), "ERR_REWARD_MANAGER");
        rewardManager = _rewardManager;
    }

    function createConnector(
        address wrappedToken,
        address lpToken,
        uint8 rewardPoolId
    ) public returns (address connector) {
        require(
            connectors[msg.sender][rewardPoolId] == address(0),
            "ERR_DUP_REWARD_POOL"
        );
        require(
            connectorImpls[rewardPoolId] != address(0),
            "ERR_IMPL_NOT_FOUND"
        );
        bytes memory _data = abi.encodeWithSignature(
            "initialize(address,address,address,address,uint8)",
            msg.sender,
            rewardManager,
            wrappedToken,
            lpToken,
            rewardPoolId
        );
        connector = deployMinimal(connectorImpls[rewardPoolId], _data);
        require(connector != address(0), "ERR_CREATE_PROXY");
        connectors[msg.sender][rewardPoolId] = connector;
        emit LogCreateConnector(msg.sender, connector);
    }

    function setConnectorImpl(uint8 rewardPoolId, address implementation)
        external
        onlyOwner
    {
        require(implementation != address(0), "ERR_IMPL_INVALID");
        require(connectorImpls[rewardPoolId] == address(0), "ERR_POOL_EXISTED");
        connectorImpls[rewardPoolId] = implementation;

        emit LogSetImplementation(rewardPoolId, implementation);
    }
}
