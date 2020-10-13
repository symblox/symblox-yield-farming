pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
// import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./libs/syxOwnable.sol";
import "./interfaces/IRewardManager.sol";

contract BaseConnector is syxOwnable {
    using SafeERC20 for IERC20;

    address public lpToken;
    IRewardManager public rewardManager;
    uint8 public rewardPoolId;

    event LogInit(
        address indexed owner,
        address rewardManager,
        address lpToken,
        uint8 poolId
    );
    event LogDeposit(address indexed dst, uint256 amount);
    event LogWithdrawal(address indexed src, uint256 amount);
    event LogStake(address indexed dst, uint256 amount);
    event LogUnstake(address indexed src, uint256 amount);
    event LogReward(address indexed src, uint256 amount);

    // Empty internal constructor, to prevent people from mistakenly deploying
    // an instance of this contract, which should be used via inheritance.
    // solhint-disable-previous-line no-empty-blocks
    constructor() internal {}

    function() external payable {}

    function initialize(
        address _owner,
        address _rewardManager,
        address _lpToken,
        uint8 _rewardPoolId
    ) public initializer {
        require(_owner != address(0), "ERR_OWNER_INVALID");
        require(_rewardManager != address(0), "ERR_REWARD_MANAGER");
        require(_lpToken != address(0), "ERR_LP_TOKEN");

        syxOwnable.initialize(_owner);
        rewardManager = IRewardManager(_rewardManager);
        lpToken = _lpToken;
        rewardPoolId = _rewardPoolId;

        emit LogInit(_owner, _rewardManager, _lpToken, _rewardPoolId);
    }

    function balanceOfLpToken() external view returns (uint256) {
        (uint256 amount, ) = rewardManager.userInfo(
            uint256(rewardPoolId),
            address(this)
        );
        return amount;
    }

    function earned() external view returns (uint256) {
        return rewardManager.pendingSyx(uint256(rewardPoolId), address(this));
    }

    function getReward() external onlyOwner {
        IERC20 syx = IERC20(rewardManager.syx());
        rewardManager.getReward(uint256(rewardPoolId));

        uint256 syxAmount = syx.balanceOf(address(this));

        syx.safeTransfer(msg.sender, syxAmount);

        emit LogReward(msg.sender, syxAmount);
    }

    /**
     * @dev Don't need to check onlyOwner as the caller needs to check that
     */
    function stakeLpToken(uint256 amount) internal {
        IERC20 syx = IERC20(rewardManager.syx());
        (uint256 currBalance, ) = rewardManager.userInfo(
            uint256(rewardPoolId),
            address(this)
        );
        if (
            IERC20(lpToken).allowance(address(this), address(rewardManager)) <
            amount
        ) {
            IERC20(lpToken).approve(address(rewardManager), amount);
        }

        uint256 newBalance = rewardManager.deposit(
            uint256(rewardPoolId),
            amount
        );

        require(newBalance - currBalance == amount, "ERR_STAKE_REWARD");

        uint256 syxAmount = syx.balanceOf(address(this));
        syx.safeTransfer(msg.sender, syxAmount);

        emit LogReward(msg.sender, syxAmount);
        emit LogStake(msg.sender, newBalance);
    }

    /**
     * @dev Don't need to check onlyOwner as the caller needs to check that
     */
    function unstakeLpToken(uint256 lpTokenAmount) internal {
        IERC20 syx = IERC20(rewardManager.syx());
        (uint256 currBalance, ) = rewardManager.userInfo(
            uint256(rewardPoolId),
            address(this)
        );
        require(currBalance >= lpTokenAmount, "ERR_NOT_ENOUGH_BAL");

        uint256 newBalance = rewardManager.withdraw(
            uint256(rewardPoolId),
            lpTokenAmount
        );

        require(
            currBalance - newBalance == lpTokenAmount,
            "ERR_UNSTAKE_REWARD"
        );

        uint256 syxAmount = syx.balanceOf(address(this));
        syx.safeTransfer(msg.sender, syxAmount);

        emit LogReward(msg.sender, syxAmount);
        emit LogUnstake(msg.sender, lpTokenAmount);
    }
}
