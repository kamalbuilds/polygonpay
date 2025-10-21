// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PaymentProcessor
 * @author PolygonPay
 * @notice Core payment processing contract for stablecoin merchant payments
 * @dev Implements instant settlement with 0.4% platform fee
 */
contract PaymentProcessor is
    Initializable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;

    // State variables
    uint256 public constant PLATFORM_FEE_BPS = 40; // 0.4% = 40 basis points
    uint256 public constant BPS_DENOMINATOR = 10000;

    address public feeCollector;
    mapping(address => bool) public supportedTokens; // USDC, USDT
    mapping(address => uint256) public merchantBalances;
    mapping(bytes32 => bool) public processedPayments;

    // Events
    event PaymentReceived(
        bytes32 indexed paymentId,
        address indexed merchant,
        address indexed customer,
        address token,
        uint256 amount,
        uint256 fee,
        uint256 timestamp
    );

    event Settlement(
        address indexed merchant,
        address token,
        uint256 amount,
        uint256 timestamp
    );

    event TokenSupported(address indexed token, bool supported);
    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the payment processor
     * @param _feeCollector Address to collect platform fees
     * @param _usdc USDC token address on Polygon
     * @param _usdt USDT token address on Polygon
     */
    function initialize(
        address _feeCollector,
        address _usdc,
        address _usdt
    ) public initializer {
        __Ownable_init(msg.sender);
        __Pausable_init();
        __ReentrancyGuard_init();

        require(_feeCollector != address(0), "Invalid fee collector");
        require(_usdc != address(0), "Invalid USDC address");
        require(_usdt != address(0), "Invalid USDT address");

        feeCollector = _feeCollector;
        supportedTokens[_usdc] = true;
        supportedTokens[_usdt] = true;

        emit TokenSupported(_usdc, true);
        emit TokenSupported(_usdt, true);
    }

    /**
     * @notice Process customer payment to merchant
     * @param merchant Merchant wallet address
     * @param token Stablecoin token address (USDC/USDT)
     * @param amount Payment amount in token decimals
     * @param paymentId Unique payment identifier
     */
    function processPayment(
        address merchant,
        address token,
        uint256 amount,
        bytes32 paymentId
    ) external nonReentrant whenNotPaused {
        require(merchant != address(0), "Invalid merchant");
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be > 0");
        require(!processedPayments[paymentId], "Payment already processed");

        processedPayments[paymentId] = true;

        // Calculate fee (0.4%)
        uint256 fee = (amount * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 merchantAmount = amount - fee;

        // Transfer from customer
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Transfer fee to collector
        if (fee > 0) {
            IERC20(token).safeTransfer(feeCollector, fee);
        }

        // Transfer to merchant (instant settlement)
        IERC20(token).safeTransfer(merchant, merchantAmount);

        emit PaymentReceived(
            paymentId,
            merchant,
            msg.sender,
            token,
            amount,
            fee,
            block.timestamp
        );

        emit Settlement(merchant, token, merchantAmount, block.timestamp);
    }

    /**
     * @notice Batch process multiple payments for gas optimization
     * @param merchants Array of merchant addresses
     * @param tokens Array of token addresses
     * @param amounts Array of payment amounts
     * @param paymentIds Array of unique payment identifiers
     */
    function batchProcessPayments(
        address[] calldata merchants,
        address[] calldata tokens,
        uint256[] calldata amounts,
        bytes32[] calldata paymentIds
    ) external nonReentrant whenNotPaused {
        require(
            merchants.length == tokens.length &&
            tokens.length == amounts.length &&
            amounts.length == paymentIds.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < merchants.length; i++) {
            processPayment(merchants[i], tokens[i], amounts[i], paymentIds[i]);
        }
    }

    /**
     * @notice Add or remove supported stablecoin
     * @param token Token address
     * @param supported True to support, false to remove
     */
    function setSupportedToken(address token, bool supported) external onlyOwner {
        require(token != address(0), "Invalid token address");
        supportedTokens[token] = supported;
        emit TokenSupported(token, supported);
    }

    /**
     * @notice Update fee collector address
     * @param newCollector New fee collector address
     */
    function setFeeCollector(address newCollector) external onlyOwner {
        require(newCollector != address(0), "Invalid collector");
        address oldCollector = feeCollector;
        feeCollector = newCollector;
        emit FeeCollectorUpdated(oldCollector, newCollector);
    }

    /**
     * @notice Pause payment processing (emergency)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Resume payment processing
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency token recovery (owner only)
     * @param token Token address
     * @param amount Amount to recover
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
