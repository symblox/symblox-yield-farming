pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./interfaces/IWrappedToken.sol";
import "./interfaces/IBPool.sol";
import "./BaseConnector.sol";

contract BptConnector is BaseConnector {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    modifier validBpt(address token) {
        require(IBPool(lpToken).isBound(token), "ERR_TOKEN_INVALID");
        _;
    }

    event LogMultiDeposit(
        address indexed dst,
        address[] tokensIn,
        uint256[] maxAmountsIn,
        uint256 poolAmountOut
    );

    event LogMultiWithdraw(
        address indexed dst,
        address[] tokensOut,
        uint256[] minAmountsOut,
        uint256 poolAmountIn
    );

    function deposit(
        address tokenIn,
        uint256 tokenAmountIn,
        uint256 minPoolAmountOut
    ) external payable returns (uint256 poolAmountOut) {
        poolAmountOut = _deposit(tokenIn, tokenAmountIn, minPoolAmountOut);

        emit LogDeposit(msg.sender, tokenIn, tokenAmountIn, poolAmountOut);
    }

    function _deposit(
        address tokenIn,
        uint256 tokenAmountIn,
        uint256 minPoolAmountOut
    ) internal returns (uint256 poolAmountOut) {
        IERC20 tokenDeposit;
        if (tokenIn == address(0) || tokenIn == wrappedToken) {
            require(msg.value >= tokenAmountIn, "ERR_ALLOWANCE");
            IWrappedToken wToken = IWrappedToken(wrappedToken);
            tokenDeposit = IERC20(wrappedToken);
            wToken.deposit.value(msg.value)();
        } else {
            tokenDeposit = IERC20(tokenIn);
            require(
                tokenDeposit.allowance(msg.sender, address(this)) >=
                    tokenAmountIn,
                "ERR_ALLOWANCE"
            );
            // transfer the tokens here
            tokenDeposit.safeTransferFrom(
                msg.sender,
                address(this),
                tokenAmountIn
            );
        }
        //
        // deposit to the bpool
        //
        if (tokenDeposit.allowance(address(this), lpToken) < tokenAmountIn) {
            tokenDeposit.approve(lpToken, tokenAmountIn);
        }
        poolAmountOut = IBPool(lpToken).joinswapExternAmountIn(
            address(tokenDeposit),
            tokenAmountIn,
            minPoolAmountOut
        );
        require(poolAmountOut > 0, "ERR_BPOOL_DEPOSIT");

        super.stakeLpToken(poolAmountOut);
    }

    function withdraw(
        address tokenOut,
        uint256 amount,
        uint256 minAmountOut
    ) external validBpt(tokenOut) onlyOwner returns (uint256 tokenAmountOut) {
        tokenAmountOut = _withdraw(tokenOut, amount, minAmountOut);
        emit LogWithdrawal(msg.sender, tokenOut, tokenAmountOut, amount);
    }

    function _withdraw(
        address tokenOut,
        uint256 amount,
        uint256 minAmountOut
    ) internal returns (uint256 tokenAmountOut) {
        IWrappedToken wToken = IWrappedToken(wrappedToken);
        IERC20 tokenWithdraw;
        if (tokenOut == address(0) || tokenOut == wrappedToken) {
            tokenWithdraw = IERC20(wrappedToken);
        } else {
            tokenWithdraw = IERC20(tokenOut);
        }

        super.unstakeLpToken(amount);
        tokenAmountOut = IBPool(lpToken).exitswapPoolAmountIn(
            address(tokenWithdraw),
            amount,
            minAmountOut
        );

        if (tokenOut == address(0) || tokenOut == wrappedToken) {
            wToken.withdraw(tokenWithdraw.balanceOf(address(this)));
            tokenAmountOut = address(this).balance;
            msg.sender.transfer(tokenAmountOut);
        } else {
            tokenAmountOut = tokenWithdraw.balanceOf(address(this));
            tokenWithdraw.safeTransfer(msg.sender, tokenAmountOut);
        }
    }

    function multiDeposit(
        uint256 poolAmountOut,
        address[] calldata tokensIn,
        uint256[] calldata maxAmountsIn
    ) external payable {
        _multiDeposit(poolAmountOut, tokensIn, maxAmountsIn);

        emit LogMultiDeposit(msg.sender, tokensIn, maxAmountsIn, poolAmountOut);
    }

    function _multiDeposit(
        uint256 poolAmountOut,
        address[] memory tokensIn,
        uint256[] memory maxAmountsIn
    ) internal {
        require(poolAmountOut > 0, "ERR_BPOOL_DEPOSIT");
        require(tokensIn.length == maxAmountsIn.length, "ERR_PARAMS_LENGTH");
        IBPool bpt = IBPool(lpToken);
        IWrappedToken wToken = IWrappedToken(wrappedToken);
        for (uint256 i = 0; i < tokensIn.length; i++) {
            IERC20 tokenDeposit;
            uint256 maxAmountIn = maxAmountsIn[i];
            if (tokensIn[i] == address(0) || tokensIn[i] == wrappedToken) {
                require(bpt.isBound(wrappedToken), "ERR_TOKEN_INVALID");
                require(msg.value >= maxAmountIn, "ERR_AMOUNT");
                tokenDeposit = IERC20(wrappedToken);
                wToken.deposit.value(msg.value)();
            } else {
                require(bpt.isBound(tokensIn[i]), "ERR_TOKEN_INVALID");
                tokenDeposit = IERC20(tokensIn[i]);

                require(
                    tokenDeposit.allowance(msg.sender, address(this)) >=
                        maxAmountIn,
                    "ERR_ALLOWANCE"
                );
                // transfer the tokens here
                tokenDeposit.safeTransferFrom(
                    msg.sender,
                    address(this),
                    maxAmountIn
                );
            }

            if (tokenDeposit.allowance(address(this), lpToken) < maxAmountIn) {
                tokenDeposit.approve(lpToken, maxAmountIn);
            }
        }

        IBPool(lpToken).joinPool(poolAmountOut, maxAmountsIn);
        //
        // stake to RewardManager
        //
        super.stakeLpToken(poolAmountOut);

        for (uint256 i = 0; i < tokensIn.length; i++) {
            if (tokensIn[i] == address(0)) {
                wToken.withdraw(IERC20(wrappedToken).balanceOf(address(this)));
                msg.sender.transfer(address(this).balance);
            } else {
                IERC20 tokenDeposit = IERC20(tokensIn[i]);
                // Excess return to the user
                tokenDeposit.safeTransfer(
                    msg.sender,
                    tokenDeposit.balanceOf(address(this))
                );
            }
        }
    }

    function multiWithdraw(
        uint256 poolAmountIn,
        address[] calldata tokensOut,
        uint256[] calldata minAmountsOut
    ) external {
        _multiWithdraw(poolAmountIn, tokensOut, minAmountsOut);

        emit LogMultiWithdraw(
            msg.sender,
            tokensOut,
            minAmountsOut,
            poolAmountIn
        );
    }

    function _multiWithdraw(
        uint256 poolAmountIn,
        address[] memory tokensOut,
        uint256[] memory minAmountsOut
    ) internal {
        require(poolAmountIn > 0, "ERR_BPOOL_DEPOSIT");
        require(tokensOut.length == minAmountsOut.length, "ERR_PARAMS_LENGTH");
        IBPool bpt = IBPool(lpToken);
        IWrappedToken wToken = IWrappedToken(wrappedToken);
        super.unstakeLpToken(poolAmountIn);

        bpt.exitPool(poolAmountIn, minAmountsOut);
        for (uint256 i = 0; i < tokensOut.length; i++) {
            if (tokensOut[i] == address(0) || tokensOut[i] == wrappedToken) {
                IERC20 tokenWithdraw = IERC20(wrappedToken);
                wToken.withdraw(tokenWithdraw.balanceOf(address(this)));
                msg.sender.transfer(address(this).balance);
            } else {
                IERC20 tokenWithdraw = IERC20(tokensOut[i]);
                tokenWithdraw.safeTransfer(
                    msg.sender,
                    tokenWithdraw.balanceOf(address(this))
                );
            }
        }
    }
}
