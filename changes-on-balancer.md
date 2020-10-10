# Changes on Balancer

Here is the list of changes on the original version of [Balancer](https://github.com/balancer-labs/balancer-core)

## Solidity Version Update

-   Update all contracts to solidity v0.5.17

## Native token support

### IWrappedToken

-   Add interface of wrapped native token functions

### BToken

-   Replace the embedded one with OpenZeppelin [IERC20](https://github.com/symblox/symblox-yield-farming/blob/76c40ceaac74f951acda2066ca6abfe71bde34cd/contracts/balancer/BToken.sol#L16)

### BFactory

-   Add a contract variable [wToken](https://github.com/symblox/symblox-yield-farming/blob/76c40ceaac74f951acda2066ca6abfe71bde34cd/contracts/balancer/BFactory.sol#L28)

-   Initialize `wToken` in the [constructor()](https://github.com/symblox/symblox-yield-farming/blob/76c40ceaac74f951acda2066ca6abfe71bde34cd/contracts/balancer/BFactory.sol#L32)

-   Pass `wToken` to BPool() when creating a new BPool by calling [newBPool()](https://github.com/symblox/symblox-yield-farming/blob/76c40ceaac74f951acda2066ca6abfe71bde34cd/contracts/balancer/BFactory.sol#L40)

### BPool

-   Add a contract variable [wToken](https://github.com/symblox/symblox-yield-farming/blob/76c40ceaac74f951acda2066ca6abfe71bde34cd/contracts/balancer/BPool.sol#L70)

-   Initialize `wToken` in the [constructor()](https://github.com/symblox/symblox-yield-farming/blob/76c40ceaac74f951acda2066ca6abfe71bde34cd/contracts/balancer/BPool.sol#L86)

-   Add the [default payable function](https://github.com/symblox/symblox-yield-farming/blob/76c40ceaac74f951acda2066ca6abfe71bde34cd/contracts/balancer/BPool.sol#L94) to accept native tokens

-   Add [swapWTokenAmountIn()](https://github.com/symblox/symblox-yield-farming/blob/76c40ceaac74f951acda2066ca6abfe71bde34cd/contracts/balancer/BPool.sol#L407)

-   Add [swapExactAmountInWTokenOut()](https://github.com/symblox/symblox-yield-farming/blob/76c40ceaac74f951acda2066ca6abfe71bde34cd/contracts/balancer/BPool.sol#L455)

-   Add [joinswapWTokenIn()](https://github.com/symblox/symblox-yield-farming/blob/76c40ceaac74f951acda2066ca6abfe71bde34cd/contracts/balancer/BPool.sol#L551)

-   Add [exitswapPoolAmountInWTokenOut()](https://github.com/symblox/symblox-yield-farming/blob/76c40ceaac74f951acda2066ca6abfe71bde34cd/contracts/balancer/BPool.sol#L633)

-   Add internal function [\_swapExactAmountIn()](https://github.com/symblox/symblox-yield-farming/blob/76c40ceaac74f951acda2066ca6abfe71bde34cd/contracts/balancer/BPool.sol#L724)

-   Add internal function [\_joinswapExternAmountIn()](https://github.com/symblox/symblox-yield-farming/blob/76c40ceaac74f951acda2066ca6abfe71bde34cd/contracts/balancer/BPool.sol#L788)

-   Add internal function [\_exitswapPoolAmountIn()](https://github.com/symblox/symblox-yield-farming/blob/76c40ceaac74f951acda2066ca6abfe71bde34cd/contracts/balancer/BPool.sol#L820)

-   Modify [swapExactAmountIn()](https://github.com/symblox/symblox-yield-farming/blob/76c40ceaac74f951acda2066ca6abfe71bde34cd/contracts/balancer/BPool.sol#L407)

-   Modify [joinswapExternAmountIn()](https://github.com/symblox/symblox-yield-farming/blob/76c40ceaac74f951acda2066ca6abfe71bde34cd/contracts/balancer/BPool.sol#L568)

-   Modify [exitswapPoolAmountIn()](https://github.com/symblox/symblox-yield-farming/blob/76c40ceaac74f951acda2066ca6abfe71bde34cd/contracts/balancer/BPool.sol#L619)

-   Remove [joinPool()](https://github.com/symblox/symblox-yield-farming/blob/76c40ceaac74f951acda2066ca6abfe71bde34cd/contracts/balancer/BPool.sol#L353)

-   Remove [joinswapPoolAmountOut()](https://github.com/symblox/symblox-yield-farming/blob/76c40ceaac74f951acda2066ca6abfe71bde34cd/contracts/balancer/BPool.sol#L581)

-   Remove [exitswapExternAmountOut()](https://github.com/symblox/symblox-yield-farming/blob/76c40ceaac74f951acda2066ca6abfe71bde34cd/contracts/balancer/BPool.sol#L646)
