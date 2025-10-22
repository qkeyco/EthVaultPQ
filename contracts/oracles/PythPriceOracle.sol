// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "pyth-sdk-solidity/IPyth.sol";
import "pyth-sdk-solidity/PythStructs.sol";

/**
 * @title PythPriceOracle
 * @notice Integrates Pyth Network price feeds for real-time token valuation
 * @dev Used to price vesting tokens in USD and other currencies
 *
 * Prize Eligibility: Pyth Network Integration
 *
 * Features:
 * - Multi-token price support
 * - Configurable staleness checks
 * - USD value calculations for vesting
 * - Emergency pause mechanism
 */
contract PythPriceOracle is Ownable, ReentrancyGuard {
    IPyth public pyth;

    /// @notice Maximum age of price data in seconds (default: 60 seconds)
    uint256 public maxPriceAge = 60;

    /// @notice Minimum confidence ratio (basis points, 10000 = 100%)
    /// @dev Tightened to 0.5% for DeFi security (was 1%)
    uint256 public minConfidenceBps = 50; // 0.5% max uncertainty

    /// @notice Emergency pause flag
    bool public paused;

    /// @notice Mapping of token addresses to Pyth price feed IDs
    mapping(address => bytes32) public tokenToPriceId;

    /// @notice Supported token list
    address[] public supportedTokens;

    // Events
    event PriceIdUpdated(address indexed token, bytes32 priceId);
    event MaxPriceAgeUpdated(uint256 oldAge, uint256 newAge);
    event MinConfidenceUpdated(uint256 oldBps, uint256 newBps);
    event PriceQueried(address indexed token, int64 price, uint64 timestamp);
    event Paused(address indexed by);
    event Unpaused(address indexed by);

    // Errors
    error OracleIsPaused();
    error PriceNotAvailable(address token);
    error PriceTooOld(uint256 age, uint256 maxAge);
    error PriceNotConfident(uint256 confidence, uint256 minRequired);
    error InvalidPriceId();
    error InvalidToken();
    error PriceIsNegative();

    /**
     * @notice Constructor
     * @param _pyth Address of Pyth contract on this chain
     * @param _owner Owner address
     */
    constructor(address _pyth, address _owner) Ownable(_owner) {
        require(_pyth != address(0), "Invalid Pyth address");
        pyth = IPyth(_pyth);
    }

    /**
     * @notice Register a token's Pyth price feed ID
     * @param token Token address
     * @param priceId Pyth price feed ID
     */
    function setPriceId(address token, bytes32 priceId) external onlyOwner {
        require(token != address(0), "Invalid token");
        require(priceId != bytes32(0), "Invalid price ID");

        // Add to supported tokens if new
        if (tokenToPriceId[token] == bytes32(0)) {
            supportedTokens.push(token);
        }

        tokenToPriceId[token] = priceId;
        emit PriceIdUpdated(token, priceId);
    }

    /**
     * @notice Update maximum price age
     * @param _maxAge New max age in seconds
     */
    function setMaxPriceAge(uint256 _maxAge) external onlyOwner {
        require(_maxAge > 0 && _maxAge <= 1 hours, "Invalid max age");
        uint256 oldAge = maxPriceAge;
        maxPriceAge = _maxAge;
        emit MaxPriceAgeUpdated(oldAge, _maxAge);
    }

    /**
     * @notice Update minimum confidence ratio
     * @param _minBps New minimum confidence in basis points
     */
    function setMinConfidence(uint256 _minBps) external onlyOwner {
        require(_minBps <= 1000, "Confidence too high"); // Max 10%
        uint256 oldBps = minConfidenceBps;
        minConfidenceBps = _minBps;
        emit MinConfidenceUpdated(oldBps, _minBps);
    }

    /**
     * @notice Pause oracle in emergency
     */
    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    /**
     * @notice Unpause oracle
     */
    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    /**
     * @notice Get latest price for a token
     * @param token Token address
     * @return price Price with 8 decimals (Pyth standard)
     * @return expo Price exponent (always -8 for USD prices)
     * @return timestamp Price update time
     * @dev IMPORTANT: Call updatePriceFeeds() first to ensure fresh prices
     * @dev This function validates staleness, but caller should update feeds proactively
     */
    function getPrice(address token)
        external
        view
        returns (int64 price, int32 expo, uint256 timestamp)
    {
        if (paused) revert OracleIsPaused();

        bytes32 priceId = tokenToPriceId[token];
        if (priceId == bytes32(0)) revert PriceNotAvailable(token);

        // Note: getPriceUnsafe is safe here because we validate staleness below
        // Callers should still call updatePriceFeeds() first for best results
        PythStructs.Price memory pythPrice = pyth.getPriceUnsafe(priceId);

        // Validate price (includes staleness check)
        _validatePrice(pythPrice);

        return (pythPrice.price, pythPrice.expo, pythPrice.publishTime);
    }

    /**
     * @notice Get USD value of token amount
     * @param token Token address
     * @param amount Token amount (in token's decimals)
     * @param tokenDecimals Token decimals (e.g., 18 for ETH, 6 for USDC)
     * @return valueUSD USD value with 8 decimals
     */
    function getValueUSD(address token, uint256 amount, uint8 tokenDecimals)
        external
        view
        returns (uint256 valueUSD)
    {
        (int64 price, int32 expo, ) = this.getPrice(token);

        require(price > 0, "Invalid price");

        // Convert to USD value
        // Formula: (amount / 10^tokenDecimals) * (price / 10^|expo|)
        // Simplified: (amount * price) / (10^tokenDecimals * 10^|expo|)

        uint256 priceUint = uint256(uint64(price));
        uint256 expoAdjustment = uint256(10) ** uint256(int256(-expo)); // Pyth uses negative expos
        uint256 tokenAdjustment = uint256(10) ** uint256(tokenDecimals);

        // Result has 8 decimals (Pyth standard)
        valueUSD = (amount * priceUint * 1e8) / (tokenAdjustment * expoAdjustment);

        return valueUSD;
    }

    /**
     * @notice Get prices for multiple tokens
     * @param tokens Array of token addresses
     * @return prices Array of prices
     * @return expos Array of exponents
     * @return timestamps Array of timestamps
     */
    function getPrices(address[] calldata tokens)
        external
        view
        returns (
            int64[] memory prices,
            int32[] memory expos,
            uint256[] memory timestamps
        )
    {
        uint256 len = tokens.length;
        prices = new int64[](len);
        expos = new int32[](len);
        timestamps = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            (prices[i], expos[i], timestamps[i]) = this.getPrice(tokens[i]);
        }

        return (prices, expos, timestamps);
    }

    /**
     * @notice Get all supported tokens
     * @return Array of supported token addresses
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }

    /**
     * @notice Check if token is supported
     * @param token Token address
     * @return True if supported
     */
    function isSupported(address token) external view returns (bool) {
        return tokenToPriceId[token] != bytes32(0);
    }

    /**
     * @notice Validate price data
     * @param price Pyth price struct
     */
    function _validatePrice(PythStructs.Price memory price) internal view {
        // Get absolute value of price (Pyth uses signed int64, some pairs can be negative/inverse)
        int64 absPrice = price.price < 0 ? -price.price : price.price;
        if (absPrice == 0) revert PriceIsNegative();

        // Check staleness
        uint256 age = block.timestamp - price.publishTime;
        if (age > maxPriceAge) revert PriceTooOld(age, maxPriceAge);

        // Check confidence interval
        // Confidence should be small relative to price (use absolute value)
        uint256 confidenceBps = (uint256(uint64(price.conf)) * 10000) / uint256(uint64(absPrice));
        if (confidenceBps > minConfidenceBps) {
            revert PriceNotConfident(confidenceBps, minConfidenceBps);
        }
    }

    /**
     * @notice Update price feeds (call this before getting prices if needed)
     * @param updateData Array of price update data from Pyth API
     * @dev Caller must pay the update fee
     */
    function updatePriceFeeds(bytes[] calldata updateData) external payable nonReentrant {
        if (paused) revert OracleIsPaused();

        uint256 fee = pyth.getUpdateFee(updateData);
        require(msg.value >= fee, "Insufficient update fee");

        pyth.updatePriceFeeds{value: fee}(updateData);

        // Refund excess
        if (msg.value > fee) {
            (bool success, ) = msg.sender.call{value: msg.value - fee}("");
            require(success, "Refund failed");
        }
    }

    /**
     * @notice Get update fee for price feeds
     * @param updateData Price update data
     * @return fee Fee in native token (wei)
     */
    function getUpdateFee(bytes[] calldata updateData) external view returns (uint256 fee) {
        return pyth.getUpdateFee(updateData);
    }
}
