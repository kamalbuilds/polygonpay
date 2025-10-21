// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title FeeManager
 * @author PolygonPay
 * @notice Manages platform fee collection and distribution
 * @dev Collects 0.35% platform fee from all transactions
 */
contract FeeManager is Initializable, OwnableUpgradeable {
    using SafeERC20 for IERC20;

    struct FeeData {
        uint256 totalCollected;
        uint256 lastWithdrawal;
        uint256 withdrawalCount;
    }

    mapping(address => FeeData) public tokenFees; // token => fee data
    address public treasury;

    // Events
    event FeeCollected(address indexed token, uint256 amount, uint256 timestamp);
    event FeeWithdrawn(address indexed token, uint256 amount, address indexed recipient);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize fee manager
     * @param _treasury Treasury address for fee collection
     */
    function initialize(address _treasury) public initializer {
        __Ownable_init(msg.sender);
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }

    /**
     * @notice Record fee collection
     * @param token Token address
     * @param amount Fee amount collected
     */
    function recordFee(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "Invalid token");
        require(amount > 0, "Amount must be > 0");

        tokenFees[token].totalCollected += amount;

        emit FeeCollected(token, amount, block.timestamp);
    }

    /**
     * @notice Withdraw collected fees to treasury
     * @param token Token address
     */
    function withdrawFees(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");

        tokenFees[token].lastWithdrawal = block.timestamp;
        tokenFees[token].withdrawalCount++;

        IERC20(token).safeTransfer(treasury, balance);

        emit FeeWithdrawn(token, balance, treasury);
    }

    /**
     * @notice Withdraw fees for multiple tokens
     * @param tokens Array of token addresses
     */
    function batchWithdrawFees(address[] calldata tokens) external onlyOwner {
        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 balance = IERC20(tokens[i]).balanceOf(address(this));
            if (balance > 0) {
                tokenFees[tokens[i]].lastWithdrawal = block.timestamp;
                tokenFees[tokens[i]].withdrawalCount++;
                IERC20(tokens[i]).safeTransfer(treasury, balance);
                emit FeeWithdrawn(tokens[i], balance, treasury);
            }
        }
    }

    /**
     * @notice Update treasury address
     * @param newTreasury New treasury address
     */
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @notice Get current fee balance for token
     * @param token Token address
     */
    function getFeeBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    /**
     * @notice Get fee statistics for token
     * @param token Token address
     */
    function getFeeData(address token) external view returns (FeeData memory) {
        return tokenFees[token];
    }
}
