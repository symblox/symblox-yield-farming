pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./interfaces/IBPool.sol";
import "./BaseConnector.sol";

contract BptConnector is BaseConnector {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    modifier validBpt(address token) {
        require(IBPool(lpToken).isBound(token), "ERR_TOKEN_INVALID");
        _;
    }

    /**
     * @dev Deposit first to the liquidity pool and then the reward pool to earn rewards
     * @param tokenIn ERC20 address to deposit
     * @param tokenAmountIn deposit amount, in wei
     */
    function deposit(
        address tokenIn,
        uint256 tokenAmountIn,
        uint256 minPoolAmountOut
    ) external validBpt(tokenIn) onlyOwner returns (uint256 poolAmountOut) {
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

        emit LogDeposit(msg.sender, tokenIn, tokenAmountIn, poolAmountOut);
    }

    /**
     * @dev Deposit first to the liquidity pool and then the reward pool to earn rewards
     */
    function deposit(uint256 minPoolAmountOut)
        external
        payable
        onlyOwner
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

        emit LogDeposit(msg.sender, address(0), msg.value, poolAmountOut);
    }

    /**
     * @dev Unstake from the reward pool, then withdraw from the liquidity pool
     * @param tokenOut withdraw token address
     * @param amount withdraw amount, in wei
     */
    function withdraw(
        address tokenOut,
        uint256 amount,
        uint256 minAmountOut
    ) external validBpt(tokenOut) onlyOwner returns (uint256 tokenAmountOut) {
        //
        // Withdraw the liquidity pool tokens from RewardManager
        //
        super.unstakeLpToken(amount);

        //
        // Remove liquidity from the bpool
        //
        tokenAmountOut = IBPool(lpToken).exitswapPoolAmountIn(
            tokenOut,
            amount,
            minAmountOut
        );
        IERC20(tokenOut).safeTransfer(msg.sender, tokenAmountOut);

        emit LogWithdrawal(msg.sender, tokenOut, tokenAmountOut, amount);
    }

    /**
     * @dev Unstake from the reward pool, then withdraw from the liquidity pool
     * @param amount withdraw amount, in wei
     */
    function withdraw(uint256 amount, uint256 minAmountOut)
        external
        onlyOwner
        returns (uint256 tokenAmountOut)
    {
        //
        // Withdraw the liquidity pool tokens from RewardManager
        //
        super.unstakeLpToken(amount);

        //
        // Remove liquidity from the bpool
        //
        tokenAmountOut = IBPool(lpToken).exitswapPoolAmountInWTokenOut(
            amount,
            minAmountOut
        );
        require(
            address(this).balance >= tokenAmountOut,
            "ERR_BAL_INSUFFICIENT"
        );
        msg.sender.transfer(tokenAmountOut);

        emit LogWithdrawal(msg.sender, address(0), tokenAmountOut, amount);
    }
}
