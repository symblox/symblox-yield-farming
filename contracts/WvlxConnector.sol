pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "./BaseConnector.sol";

interface IWvlx {
    function withdraw(uint256 wad) external;
}

contract WvlxConnector is BaseConnector {
    using SafeERC20 for IERC20;
    using Address for address payable;

    /**
     * @dev Firstly, deposit to the liquidity pool to get the lpToken,
     * then deposit the lpTokens to RewardManager to earn rewards
     */
    function deposit(uint256)
        external
        payable
        onlyOwner
        returns (uint256 wvlxAmount)
    {
        // Cast lpToken from address to address payable
        address payable recipient = address(uint160(address(lpToken)));
        // Send to wrap VLX contract
        recipient.sendValue(msg.value);
        // Make sure the amount received is the same as the one sent
        wvlxAmount = IERC20(lpToken).balanceOf(address(this));
        require(wvlxAmount == msg.value, "ERR_WVLX_RECEIVED");
        //
        // Deposit to the RewardManager
        //
        stakeLpToken(wvlxAmount);

        emit LogDeposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount, uint256)
        external
        onlyOwner
        returns (uint256 tokenAmountOut)
    {
        //
        // Withdraw the liquidity pool tokens from RewardManager
        //
        unstakeLpToken(amount);

        //
        // Withdraw VLX from wvlx (lptoken)
        //
        IWvlx(lpToken).withdraw(amount);

        require(address(this).balance == amount, "ERR_VLX_RECEIVED");

        tokenAmountOut = address(this).balance;
        msg.sender.transfer(tokenAmountOut);

        emit LogWithdrawal(msg.sender, tokenAmountOut);
    }
}
