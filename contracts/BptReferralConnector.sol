pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./interfaces/IBPool.sol";
import "./BptConnector.sol";

contract BptReferralConnector is BptConnector {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    event LogDepositWithReferral(
        address indexed dst,
        address indexed referral,
        address indexed tokenIn,
        uint256 tokenAmountIn,
        uint256 poolAmountOut
    );

    event LogMultiDepositWithReferral(
        address indexed dst,
        address indexed referral,
        address[] tokensIn,
        uint256[] maxAmountsIn,
        uint256 poolAmountOut
    );

    function deposit(
        address tokenIn,
        uint256 tokenAmountIn,
        uint256 minPoolAmountOut,
        address referral
    ) external payable returns (uint256 poolAmountOut) {
        poolAmountOut = _deposit(tokenIn, tokenAmountIn, minPoolAmountOut);

        emit LogDepositWithReferral(
            msg.sender,
            referral,
            tokenIn,
            tokenAmountIn,
            poolAmountOut
        );
    }

    function multiDeposit(
        uint256 poolAmountOut,
        address[] calldata tokensIn,
        uint256[] calldata maxAmountsIn,
        address referral
    ) external payable {
        super._multiDeposit(poolAmountOut, tokensIn, maxAmountsIn);

        emit LogMultiDepositWithReferral(
            msg.sender,
            referral,
            tokensIn,
            maxAmountsIn,
            poolAmountOut
        );
    }
}
