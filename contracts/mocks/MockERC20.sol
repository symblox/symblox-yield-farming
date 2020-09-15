pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";

contract MockERC20 is ERC20, ERC20Detailed, ERC20Mintable {
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply
    ) public ERC20Detailed(name, symbol, decimals) {
        _mint(msg.sender, initialSupply);
    }

    function() external payable {
        mint(msg.sender, msg.value * 1000);
    }

    function mint(address to, uint256 value) public returns (bool) {
        require(value <= 100000 ether, "dont be greedy");
        _mint(to, value);
        return true;
    }
}
