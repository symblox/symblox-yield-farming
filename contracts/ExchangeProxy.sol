pragma solidity 0.5.17;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

interface PoolInterface {
    function swapExactAmountIn(
        address,
        uint256,
        address,
        uint256,
        uint256
    ) external returns (uint256, uint256);

    function swapExactAmountOut(
        address,
        uint256,
        address,
        uint256,
        uint256
    ) external returns (uint256, uint256);

    function calcInGivenOut(
        uint256,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256
    ) external pure returns (uint256);

    function calcOutGivenIn(
        uint256,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256
    ) external pure returns (uint256);

    function getDenormalizedWeight(address) external view returns (uint256);

    function getBalance(address) external view returns (uint256);

    function getSwapFee() external view returns (uint256);
}

interface TokenInterface {
    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    function approve(address, uint256) external returns (bool);

    function transfer(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function deposit() external payable;

    function withdraw(uint256) external;
}

interface RegistryInterface {
    function getBestPoolsWithLimit(
        address,
        address,
        uint256
    ) external view returns (address[] memory);
}

contract ExchangeProxy is Ownable {
    using SafeMath for uint256;

    struct Pool {
        address pool;
        uint256 tokenBalanceIn;
        uint256 tokenWeightIn;
        uint256 tokenBalanceOut;
        uint256 tokenWeightOut;
        uint256 swapFee;
        uint256 effectiveLiquidity;
    }

    struct Swap {
        address pool;
        address tokenIn;
        address tokenOut;
        uint256 swapAmount; // tokenInAmount / tokenOutAmount
        uint256 limitReturnAmount; // minAmountOut / maxAmountIn
        uint256 maxPrice;
    }

    TokenInterface public wvlx;
    RegistryInterface public registry;
    address private constant VLX_ADDRESS = address(
        0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
    );
    uint256 private constant BONE = 10**18;

    constructor(address _wvlx) public {
        wvlx = TokenInterface(_wvlx);
    }

    function setRegistry(address _registry) external onlyOwner {
        registry = RegistryInterface(_registry);
    }

    function batchSwapExactIn(
        Swap[] memory swaps,
        TokenInterface tokenIn,
        TokenInterface tokenOut,
        uint256 totalAmountIn,
        uint256 minTotalAmountOut
    ) public payable returns (uint256 totalAmountOut) {
        transferFromAll(tokenIn, totalAmountIn);

        for (uint256 i = 0; i < swaps.length; i++) {
            Swap memory swap = swaps[i];
            TokenInterface SwapTokenIn = TokenInterface(swap.tokenIn);
            PoolInterface pool = PoolInterface(swap.pool);

            if (SwapTokenIn.allowance(address(this), swap.pool) > 0) {
                SwapTokenIn.approve(swap.pool, 0);
            }
            SwapTokenIn.approve(swap.pool, swap.swapAmount);

            (uint256 tokenAmountOut, ) = pool.swapExactAmountIn(
                swap.tokenIn,
                swap.swapAmount,
                swap.tokenOut,
                swap.limitReturnAmount,
                swap.maxPrice
            );
            totalAmountOut = tokenAmountOut.add(totalAmountOut);
        }

        require(totalAmountOut >= minTotalAmountOut, "ERR_LIMIT_OUT");

        transferAll(tokenOut, totalAmountOut);
        transferAll(tokenIn, getBalance(tokenIn));
    }

    function batchSwapExactOut(
        Swap[] memory swaps,
        TokenInterface tokenIn,
        TokenInterface tokenOut,
        uint256 maxTotalAmountIn
    ) public payable returns (uint256 totalAmountIn) {
        transferFromAll(tokenIn, maxTotalAmountIn);

        for (uint256 i = 0; i < swaps.length; i++) {
            Swap memory swap = swaps[i];
            TokenInterface SwapTokenIn = TokenInterface(swap.tokenIn);
            PoolInterface pool = PoolInterface(swap.pool);

            if (SwapTokenIn.allowance(address(this), swap.pool) > 0) {
                SwapTokenIn.approve(swap.pool, 0);
            }
            SwapTokenIn.approve(swap.pool, swap.limitReturnAmount);

            (uint256 tokenAmountIn, ) = pool.swapExactAmountOut(
                swap.tokenIn,
                swap.limitReturnAmount,
                swap.tokenOut,
                swap.swapAmount,
                swap.maxPrice
            );
            totalAmountIn = tokenAmountIn.add(totalAmountIn);
        }
        require(totalAmountIn <= maxTotalAmountIn, "ERR_LIMIT_IN");

        transferAll(tokenOut, getBalance(tokenOut));
        transferAll(tokenIn, getBalance(tokenIn));
    }

    function multihopBatchSwapExactIn(
        Swap[][] memory swapSequences,
        TokenInterface tokenIn,
        TokenInterface tokenOut,
        uint256 totalAmountIn,
        uint256 minTotalAmountOut
    ) public payable returns (uint256 totalAmountOut) {
        transferFromAll(tokenIn, totalAmountIn);

        for (uint256 i = 0; i < swapSequences.length; i++) {
            uint256 tokenAmountOut;
            for (uint256 k = 0; k < swapSequences[i].length; k++) {
                Swap memory swap = swapSequences[i][k];
                TokenInterface SwapTokenIn = TokenInterface(swap.tokenIn);
                if (k == 1) {
                    // Makes sure that on the second swap the output of the first was used
                    // so there is not intermediate token leftover
                    swap.swapAmount = tokenAmountOut;
                }

                PoolInterface pool = PoolInterface(swap.pool);
                if (SwapTokenIn.allowance(address(this), swap.pool) > 0) {
                    SwapTokenIn.approve(swap.pool, 0);
                }
                SwapTokenIn.approve(swap.pool, swap.swapAmount);
                (tokenAmountOut, ) = pool.swapExactAmountIn(
                    swap.tokenIn,
                    swap.swapAmount,
                    swap.tokenOut,
                    swap.limitReturnAmount,
                    swap.maxPrice
                );
            }
            // This takes the amountOut of the last swap
            totalAmountOut = tokenAmountOut.add(totalAmountOut);
        }

        require(totalAmountOut >= minTotalAmountOut, "ERR_LIMIT_OUT");

        transferAll(tokenOut, totalAmountOut);
        transferAll(tokenIn, getBalance(tokenIn));
    }

    function multihopBatchSwapExactOut(
        Swap[][] memory swapSequences,
        TokenInterface tokenIn,
        TokenInterface tokenOut,
        uint256 maxTotalAmountIn
    ) public payable returns (uint256 totalAmountIn) {
        transferFromAll(tokenIn, maxTotalAmountIn);

        for (uint256 i = 0; i < swapSequences.length; i++) {
            uint256 tokenAmountInFirstSwap;
            // Specific code for a simple swap and a multihop (2 swaps in sequence)
            if (swapSequences[i].length == 1) {
                Swap memory swap = swapSequences[i][0];
                TokenInterface SwapTokenIn = TokenInterface(swap.tokenIn);

                PoolInterface pool = PoolInterface(swap.pool);
                if (SwapTokenIn.allowance(address(this), swap.pool) > 0) {
                    SwapTokenIn.approve(swap.pool, 0);
                }
                SwapTokenIn.approve(swap.pool, swap.limitReturnAmount);

                (tokenAmountInFirstSwap, ) = pool.swapExactAmountOut(
                    swap.tokenIn,
                    swap.limitReturnAmount,
                    swap.tokenOut,
                    swap.swapAmount,
                    swap.maxPrice
                );
            } else {
                // Consider we are swapping A -> B and B -> C. The goal is to buy a given amount
                // of token C. But first we need to buy B with A so we can then buy C with B
                // To get the exact amount of C we then first need to calculate how much B we'll need:
                uint256 intermediateTokenAmount; // This would be token B as described above
                Swap memory secondSwap = swapSequences[i][1];
                PoolInterface poolSecondSwap = PoolInterface(secondSwap.pool);
                intermediateTokenAmount = poolSecondSwap.calcInGivenOut(
                    poolSecondSwap.getBalance(secondSwap.tokenIn),
                    poolSecondSwap.getDenormalizedWeight(secondSwap.tokenIn),
                    poolSecondSwap.getBalance(secondSwap.tokenOut),
                    poolSecondSwap.getDenormalizedWeight(secondSwap.tokenOut),
                    secondSwap.swapAmount,
                    poolSecondSwap.getSwapFee()
                );

                //// Buy intermediateTokenAmount of token B with A in the first pool
                Swap memory firstSwap = swapSequences[i][0];
                TokenInterface FirstSwapTokenIn = TokenInterface(
                    firstSwap.tokenIn
                );
                PoolInterface poolFirstSwap = PoolInterface(firstSwap.pool);
                if (
                    FirstSwapTokenIn.allowance(address(this), firstSwap.pool) <
                    uint256(-1)
                ) {
                    FirstSwapTokenIn.approve(firstSwap.pool, uint256(-1));
                }

                (tokenAmountInFirstSwap, ) = poolFirstSwap.swapExactAmountOut(
                    firstSwap.tokenIn,
                    firstSwap.limitReturnAmount,
                    firstSwap.tokenOut,
                    intermediateTokenAmount, // This is the amount of token B we need
                    firstSwap.maxPrice
                );

                //// Buy the final amount of token C desired
                TokenInterface SecondSwapTokenIn = TokenInterface(
                    secondSwap.tokenIn
                );
                if (
                    SecondSwapTokenIn.allowance(
                        address(this),
                        secondSwap.pool
                    ) < uint256(-1)
                ) {
                    SecondSwapTokenIn.approve(secondSwap.pool, uint256(-1));
                }

                poolSecondSwap.swapExactAmountOut(
                    secondSwap.tokenIn,
                    secondSwap.limitReturnAmount,
                    secondSwap.tokenOut,
                    secondSwap.swapAmount,
                    secondSwap.maxPrice
                );
            }
            totalAmountIn = tokenAmountInFirstSwap.add(totalAmountIn);
        }

        require(totalAmountIn <= maxTotalAmountIn, "ERR_LIMIT_IN");

        transferAll(tokenOut, getBalance(tokenOut));
        transferAll(tokenIn, getBalance(tokenIn));
    }

    function smartSwapExactIn(
        TokenInterface tokenIn,
        TokenInterface tokenOut,
        uint256 totalAmountIn,
        uint256 minTotalAmountOut,
        uint256 nPools
    ) public payable returns (uint256 totalAmountOut) {
        Swap[] memory swaps;
        if (isVLX(tokenIn)) {
            (swaps, ) = viewSplitExactIn(
                address(wvlx),
                address(tokenOut),
                totalAmountIn,
                nPools
            );
        } else if (isVLX(tokenOut)) {
            (swaps, ) = viewSplitExactIn(
                address(tokenIn),
                address(wvlx),
                totalAmountIn,
                nPools
            );
        } else {
            (swaps, ) = viewSplitExactIn(
                address(tokenIn),
                address(tokenOut),
                totalAmountIn,
                nPools
            );
        }

        totalAmountOut = batchSwapExactIn(
            swaps,
            tokenIn,
            tokenOut,
            totalAmountIn,
            minTotalAmountOut
        );
    }

    function smartSwapExactOut(
        TokenInterface tokenIn,
        TokenInterface tokenOut,
        uint256 totalAmountOut,
        uint256 maxTotalAmountIn,
        uint256 nPools
    ) public payable returns (uint256 totalAmountIn) {
        Swap[] memory swaps;
        if (isVLX(tokenIn)) {
            (swaps, ) = viewSplitExactOut(
                address(wvlx),
                address(tokenOut),
                totalAmountOut,
                nPools
            );
        } else if (isVLX(tokenOut)) {
            (swaps, ) = viewSplitExactOut(
                address(tokenIn),
                address(wvlx),
                totalAmountOut,
                nPools
            );
        } else {
            (swaps, ) = viewSplitExactOut(
                address(tokenIn),
                address(tokenOut),
                totalAmountOut,
                nPools
            );
        }

        totalAmountIn = batchSwapExactOut(
            swaps,
            tokenIn,
            tokenOut,
            maxTotalAmountIn
        );
    }

    function viewSplitExactIn(
        address tokenIn,
        address tokenOut,
        uint256 swapAmount,
        uint256 nPools
    ) public view returns (Swap[] memory swaps, uint256 totalOutput) {
        address[] memory poolAddresses = registry.getBestPoolsWithLimit(
            tokenIn,
            tokenOut,
            nPools
        );

        Pool[] memory pools = new Pool[](poolAddresses.length);
        uint256 sumEffectiveLiquidity;
        for (uint256 i = 0; i < poolAddresses.length; i++) {
            pools[i] = getPoolData(tokenIn, tokenOut, poolAddresses[i]);
            sumEffectiveLiquidity = sumEffectiveLiquidity.add(
                pools[i].effectiveLiquidity
            );
        }

        uint256[] memory bestInputAmounts = new uint256[](pools.length);
        uint256 totalInputAmount;
        for (uint256 i = 0; i < pools.length; i++) {
            bestInputAmounts[i] = swapAmount
                .mul(pools[i].effectiveLiquidity)
                .div(sumEffectiveLiquidity);
            totalInputAmount = totalInputAmount.add(bestInputAmounts[i]);
        }

        if (totalInputAmount < swapAmount) {
            bestInputAmounts[0] = bestInputAmounts[0].add(
                swapAmount.sub(totalInputAmount)
            );
        } else {
            bestInputAmounts[0] = bestInputAmounts[0].sub(
                totalInputAmount.sub(swapAmount)
            );
        }

        swaps = new Swap[](pools.length);

        for (uint256 i = 0; i < pools.length; i++) {
            swaps[i] = Swap({
                pool: pools[i].pool,
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                swapAmount: bestInputAmounts[i],
                limitReturnAmount: 0,
                maxPrice: uint256(-1)
            });
        }

        totalOutput = calcTotalOutExactIn(bestInputAmounts, pools);

        return (swaps, totalOutput);
    }

    function viewSplitExactOut(
        address tokenIn,
        address tokenOut,
        uint256 swapAmount,
        uint256 nPools
    ) public view returns (Swap[] memory swaps, uint256 totalOutput) {
        address[] memory poolAddresses = registry.getBestPoolsWithLimit(
            tokenIn,
            tokenOut,
            nPools
        );

        Pool[] memory pools = new Pool[](poolAddresses.length);
        uint256 sumEffectiveLiquidity;
        for (uint256 i = 0; i < poolAddresses.length; i++) {
            pools[i] = getPoolData(tokenIn, tokenOut, poolAddresses[i]);
            sumEffectiveLiquidity = sumEffectiveLiquidity.add(
                pools[i].effectiveLiquidity
            );
        }

        uint256[] memory bestInputAmounts = new uint256[](pools.length);
        uint256 totalInputAmount;
        for (uint256 i = 0; i < pools.length; i++) {
            bestInputAmounts[i] = swapAmount
                .mul(pools[i].effectiveLiquidity)
                .div(sumEffectiveLiquidity);
            totalInputAmount = totalInputAmount.add(bestInputAmounts[i]);
        }

        if (totalInputAmount < swapAmount) {
            bestInputAmounts[0] = bestInputAmounts[0].add(
                swapAmount.sub(totalInputAmount)
            );
        } else {
            bestInputAmounts[0] = bestInputAmounts[0].sub(
                totalInputAmount.sub(swapAmount)
            );
        }

        swaps = new Swap[](pools.length);

        for (uint256 i = 0; i < pools.length; i++) {
            swaps[i] = Swap({
                pool: pools[i].pool,
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                swapAmount: bestInputAmounts[i],
                limitReturnAmount: uint256(-1),
                maxPrice: uint256(-1)
            });
        }

        totalOutput = calcTotalOutExactOut(bestInputAmounts, pools);

        return (swaps, totalOutput);
    }

    function getPoolData(
        address tokenIn,
        address tokenOut,
        address poolAddress
    ) internal view returns (Pool memory) {
        PoolInterface pool = PoolInterface(poolAddress);
        uint256 tokenBalanceIn = pool.getBalance(tokenIn);
        uint256 tokenBalanceOut = pool.getBalance(tokenOut);
        uint256 tokenWeightIn = pool.getDenormalizedWeight(tokenIn);
        uint256 tokenWeightOut = pool.getDenormalizedWeight(tokenOut);
        uint256 swapFee = pool.getSwapFee();

        uint256 effectiveLiquidity = calcEffectiveLiquidity(
            tokenWeightIn,
            tokenBalanceOut,
            tokenWeightOut
        );
        Pool memory returnPool = Pool({
            pool: poolAddress,
            tokenBalanceIn: tokenBalanceIn,
            tokenWeightIn: tokenWeightIn,
            tokenBalanceOut: tokenBalanceOut,
            tokenWeightOut: tokenWeightOut,
            swapFee: swapFee,
            effectiveLiquidity: effectiveLiquidity
        });

        return returnPool;
    }

    function calcEffectiveLiquidity(
        uint256 tokenWeightIn,
        uint256 tokenBalanceOut,
        uint256 tokenWeightOut
    ) internal pure returns (uint256 effectiveLiquidity) {
        // Bo * wi/(wi+wo)
        effectiveLiquidity = tokenWeightIn
            .mul(BONE)
            .div(tokenWeightOut.add(tokenWeightIn))
            .mul(tokenBalanceOut)
            .div(BONE);

        return effectiveLiquidity;
    }

    function calcTotalOutExactIn(
        uint256[] memory bestInputAmounts,
        Pool[] memory bestPools
    ) internal pure returns (uint256 totalOutput) {
        totalOutput = 0;
        for (uint256 i = 0; i < bestInputAmounts.length; i++) {
            uint256 output = PoolInterface(bestPools[i].pool).calcOutGivenIn(
                bestPools[i].tokenBalanceIn,
                bestPools[i].tokenWeightIn,
                bestPools[i].tokenBalanceOut,
                bestPools[i].tokenWeightOut,
                bestInputAmounts[i],
                bestPools[i].swapFee
            );

            totalOutput = totalOutput.add(output);
        }
        return totalOutput;
    }

    function calcTotalOutExactOut(
        uint256[] memory bestInputAmounts,
        Pool[] memory bestPools
    ) internal pure returns (uint256 totalOutput) {
        totalOutput = 0;
        for (uint256 i = 0; i < bestInputAmounts.length; i++) {
            uint256 output = PoolInterface(bestPools[i].pool).calcInGivenOut(
                bestPools[i].tokenBalanceIn,
                bestPools[i].tokenWeightIn,
                bestPools[i].tokenBalanceOut,
                bestPools[i].tokenWeightOut,
                bestInputAmounts[i],
                bestPools[i].swapFee
            );

            totalOutput = totalOutput.add(output);
        }
        return totalOutput;
    }

    function transferFromAll(TokenInterface token, uint256 amount)
        internal
        returns (bool)
    {
        if (isVLX(token)) {
            wvlx.deposit.value(msg.value)();
        } else {
            require(
                token.transferFrom(msg.sender, address(this), amount),
                "ERR_TRANSFER_FAILED"
            );
        }
    }

    function getBalance(TokenInterface token) internal view returns (uint256) {
        if (isVLX(token)) {
            return wvlx.balanceOf(address(this));
        } else {
            return token.balanceOf(address(this));
        }
    }

    function transferAll(TokenInterface token, uint256 amount)
        internal
        returns (bool)
    {
        if (amount == 0) {
            return true;
        }

        if (isVLX(token)) {
            wvlx.withdraw(amount);
            (bool xfer, ) = msg.sender.call.value(amount)("");
            require(xfer, "ERR_VLX_FAILED");
        } else {
            require(token.transfer(msg.sender, amount), "ERR_TRANSFER_FAILED");
        }
    }

    function isVLX(TokenInterface token) internal view returns (bool) {
        if (address(token) == VLX_ADDRESS || address(token) == address(wvlx)) {
            return true;
        } else {
            return false;
        }
    }

    function() external payable {}
}
