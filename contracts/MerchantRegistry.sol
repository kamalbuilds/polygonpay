// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title MerchantRegistry
 * @author PolygonPay
 * @notice Registry for merchant onboarding and KYB verification
 * @dev Integrates with Polygon ID for decentralized identity verification
 */
contract MerchantRegistry is Initializable, OwnableUpgradeable {

    struct Merchant {
        address wallet;
        string businessName;
        string vatNumber; // UAE VAT registration
        string polygonIdDID; // Polygon ID decentralized identifier
        bool isVerified;
        bool isActive;
        uint256 registeredAt;
        uint256 totalTransactions;
        uint256 totalVolume;
    }

    mapping(address => Merchant) public merchants;
    mapping(string => address) public vatToMerchant; // VAT number -> wallet
    address[] public merchantList;

    // Events
    event MerchantRegistered(
        address indexed wallet,
        string businessName,
        string vatNumber,
        uint256 timestamp
    );

    event MerchantVerified(address indexed wallet, string polygonIdDID);
    event MerchantStatusUpdated(address indexed wallet, bool isActive);
    event TransactionRecorded(address indexed wallet, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the merchant registry
     */
    function initialize() public initializer {
        __Ownable_init(msg.sender);
    }

    /**
     * @notice Register new merchant
     * @param businessName Legal business name
     * @param vatNumber UAE VAT registration number
     * @param polygonIdDID Polygon ID decentralized identifier
     */
    function registerMerchant(
        string calldata businessName,
        string calldata vatNumber,
        string calldata polygonIdDID
    ) external {
        require(merchants[msg.sender].wallet == address(0), "Already registered");
        require(bytes(businessName).length > 0, "Invalid business name");
        require(bytes(vatNumber).length > 0, "Invalid VAT number");
        require(vatToMerchant[vatNumber] == address(0), "VAT already registered");

        merchants[msg.sender] = Merchant({
            wallet: msg.sender,
            businessName: businessName,
            vatNumber: vatNumber,
            polygonIdDID: polygonIdDID,
            isVerified: false,
            isActive: true,
            registeredAt: block.timestamp,
            totalTransactions: 0,
            totalVolume: 0
        });

        vatToMerchant[vatNumber] = msg.sender;
        merchantList.push(msg.sender);

        emit MerchantRegistered(msg.sender, businessName, vatNumber, block.timestamp);
    }

    /**
     * @notice Verify merchant (admin only)
     * @param merchant Merchant wallet address
     */
    function verifyMerchant(address merchant) external onlyOwner {
        require(merchants[merchant].wallet != address(0), "Merchant not found");
        merchants[merchant].isVerified = true;
        emit MerchantVerified(merchant, merchants[merchant].polygonIdDID);
    }

    /**
     * @notice Update merchant active status
     * @param merchant Merchant wallet address
     * @param isActive New status
     */
    function setMerchantStatus(address merchant, bool isActive) external onlyOwner {
        require(merchants[merchant].wallet != address(0), "Merchant not found");
        merchants[merchant].isActive = isActive;
        emit MerchantStatusUpdated(merchant, isActive);
    }

    /**
     * @notice Record transaction for merchant (called by PaymentProcessor)
     * @param merchant Merchant wallet address
     * @param amount Transaction amount
     */
    function recordTransaction(address merchant, uint256 amount) external {
        require(merchants[merchant].wallet != address(0), "Merchant not found");
        merchants[merchant].totalTransactions++;
        merchants[merchant].totalVolume += amount;
        emit TransactionRecorded(merchant, amount);
    }

    /**
     * @notice Get merchant details
     * @param merchant Merchant wallet address
     */
    function getMerchant(address merchant) external view returns (Merchant memory) {
        return merchants[merchant];
    }

    /**
     * @notice Check if merchant is verified and active
     * @param merchant Merchant wallet address
     */
    function isMerchantActive(address merchant) external view returns (bool) {
        return merchants[merchant].isVerified && merchants[merchant].isActive;
    }

    /**
     * @notice Get total merchant count
     */
    function getMerchantCount() external view returns (uint256) {
        return merchantList.length;
    }

    /**
     * @notice Get merchant by VAT number
     * @param vatNumber UAE VAT registration number
     */
    function getMerchantByVAT(string calldata vatNumber) external view returns (address) {
        return vatToMerchant[vatNumber];
    }
}
