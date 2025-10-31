// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title MockQKEY
 * @notice Mock QKEY token for testing vesting schedules
 * @dev Simple ERC20 with minting capability
 */
contract MockQKEY is ERC20, Ownable {
    uint8 private immutable _decimals;

    /**
     * @notice Constructor
     * @param name_ Token name
     * @param symbol_ Token symbol
     * @param decimals_ Token decimals
     * @param initialSupply_ Initial supply to mint to deployer
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        _decimals = decimals_;
        if (initialSupply_ > 0) {
            _mint(msg.sender, initialSupply_);
        }
    }

    /**
     * @notice Returns the number of decimals
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @notice Mint tokens (owner only)
     * @param to Address to mint to
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens from caller
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
