pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./interfaces/IBPool.sol";
import "./BptConnector.sol";

contract BptReferralConnector is BptConnector {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    event LogDepositWithReferral(address indexed dst, address indexed referral, address indexed tokenIn, uint256 tokenAmountIn, uint256 poolAmountOut);

    /**
     * @dev Deposit first to the liquidity pool and then the reward pool to earn rewards
     * @param tokenIn ERC20 address to deposit
     * @param tokenAmountIn deposit amount, in wei
     */
    function deposit(
        address tokenIn,
        uint256 tokenAmountIn,
        uint256 minPoolAmountOut,
        address referral
    ) public validBpt(tokenIn) returns (uint256 poolAmountOut) {
        IERC20 tokenDeposit = IERC20(tokenIn);
        require(
            tokenDeposit.allowance(msg.sender, address(this)) >= tokenAmountIn,
            "ERR_ALLOWANCE"
        );
        // transfer the tokens here
        tokenDeposit.safeTransferFrom(msg.sender, address(this), tokenAmountIn);

        //
        // deposit to the bpool
        //
        if (tokenDeposit.allowance(address(this), lpToken) < tokenAmountIn) {
            tokenDeposit.approve(lpToken, tokenAmountIn);
        }
        poolAmountOut = IBPool(lpToken).joinswapExternAmountIn(
            tokenIn,
            tokenAmountIn,
            minPoolAmountOut
        );
        require(poolAmountOut > 0, "ERR_BPOOL_DEPOSIT");

        //
        // stake to RewardManager
        //
        super.stakeLpToken(poolAmountOut);

        emit LogDepositWithReferral(msg.sender, referral, tokenIn, tokenAmountIn, poolAmountOut);
    }

    /**
     * @dev Deposit first to the liquidity pool and then the reward pool to earn rewards
     */
    function deposit(uint256 minPoolAmountOut, address referral)
        public
        payable
        returns (uint256 poolAmountOut)
    {
        poolAmountOut = IBPool(lpToken).joinswapWTokenIn.value(msg.value)(
            minPoolAmountOut
        );
        require(poolAmountOut > 0, "ERR_BPOOL_DEPOSIT");

        //
        // stake to RewardManager
        //
        super.stakeLpToken(poolAmountOut);

        emit LogDepositWithReferral(msg.sender, referral, address(0), msg.value, poolAmountOut);
    }
}
