pragma solidity ^0.5.13;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./interfaces/IExchange.sol";
import "./interfaces/ISortedOracles.sol";
import "./interfaces/IReserve.sol";
import "./interfaces/IStableToken.sol";
import "./common/Initializable.sol";
import "./common/FixidityLib.sol";
import "./common/Freezable.sol";
import "./common/UsingRegistry.sol";
import "./common/interfaces/IPlanqVersionedContract.sol";
import "./common/ReentrancyGuard.sol";

/**
 * @title Contract that allows to exchange StableToken for PlanqToken and vice versa
 * using a Constant Product Market Maker Model
 */
contract Exchange is
    IExchange,
    IPlanqVersionedContract,
    Initializable,
    Ownable,
    UsingRegistry,
    ReentrancyGuard,
    Freezable
{
    using SafeMath for uint256;
    using FixidityLib for FixidityLib.Fraction;

    event Exchanged(address indexed exchanger, uint256 sellAmount, uint256 buyAmount, bool soldPlanq);
    event UpdateFrequencySet(uint256 updateFrequency);
    event MinimumReportsSet(uint256 minimumReports);
    event StableTokenSet(address indexed stable);
    event SpreadSet(uint256 spread);
    event ReserveFractionSet(uint256 reserveFraction);
    event BucketsUpdated(uint256 planqBucket, uint256 stableBucket);

    FixidityLib.Fraction public spread;

    // Fraction of the Reserve that is committed to the planq bucket when updating
    // buckets.
    FixidityLib.Fraction public reserveFraction;

    address public stable;

    // Size of the Uniswap planq bucket
    uint256 public planqBucket;
    // Size of the Uniswap stable token bucket
    uint256 public stableBucket;

    uint256 public lastBucketUpdate = 0;
    uint256 public updateFrequency;
    uint256 public minimumReports;

    bytes32 public stableTokenRegistryId;

    modifier updateBucketsIfNecessary() {
        _updateBucketsIfNecessary();
        _;
    }

    /**
     * @notice Returns the storage, major, minor, and patch version of the contract.
     * @return Storage version of the contract.
     * @return Major version of the contract.
     * @return Minor version of the contract.
     * @return Patch version of the contract.
     */
    function getVersionNumber()
        external
        pure
        returns (
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        return (1, 2, 0, 0);
    }

    /**
     * @notice Sets initialized == true on implementation contracts
     * @param test Set to true to skip implementation initialization
     */
    constructor(bool test) public Initializable(test) {}

    /**
     * @notice Used in place of the constructor to allow the contract to be upgradable via proxy.
     * @param registryAddress The address of the registry core smart contract.
     * @param stableTokenIdentifier String identifier of stabletoken in registry
     * @param _spread Spread charged on exchanges
     * @param _reserveFraction Fraction to commit to the planq bucket
     * @param _updateFrequency The time period that needs to elapse between bucket
     * updates
     * @param _minimumReports The minimum number of fresh reports that need to be
     * present in the oracle to update buckets
     * commit to the planq bucket
     */
    function initialize(
        address registryAddress,
        string calldata stableTokenIdentifier,
        uint256 _spread,
        uint256 _reserveFraction,
        uint256 _updateFrequency,
        uint256 _minimumReports
    ) external initializer {
        _transferOwnership(msg.sender);
        setRegistry(registryAddress);
        stableTokenRegistryId = keccak256(abi.encodePacked(stableTokenIdentifier));
        setSpread(_spread);
        setReserveFraction(_reserveFraction);
        setUpdateFrequency(_updateFrequency);
        setMinimumReports(_minimumReports);
    }

    /**
     * @notice Ensures stable token address is set in storage and initializes buckets.
     * @dev Will revert if stable token is not registered or does not have oracle reports.
     */
    function activateStable() external onlyOwner {
        require(stable == address(0), "StableToken address already activated");
        _setStableToken(registry.getAddressForOrDie(stableTokenRegistryId));
        _updateBucketsIfNecessary();
    }

    /**
     * @notice Exchanges a specific amount of one token for an unspecified amount
     * (greater than a threshold) of another.
     * @param sellAmount The number of tokens to send to the exchange.
     * @param minBuyAmount The minimum number of tokens for the exchange to send in return.
     * @param sellPlanq True if the caller is sending PLQ to the exchange, false otherwise.
     * @return The number of tokens sent by the exchange.
     * @dev The caller must first have approved `sellAmount` to the exchange.
     * @dev This function can be frozen via the Freezable interface.
     */
    function sell(
        uint256 sellAmount,
        uint256 minBuyAmount,
        bool sellPlanq
    ) public onlyWhenNotFrozen updateBucketsIfNecessary nonReentrant returns (uint256) {
        (uint256 buyTokenBucket, uint256 sellTokenBucket) = _getBuyAndSellBuckets(sellPlanq);
        uint256 buyAmount = _getBuyTokenAmount(buyTokenBucket, sellTokenBucket, sellAmount);

        require(buyAmount >= minBuyAmount, "Calculated buyAmount was less than specified minBuyAmount");

        _exchange(sellAmount, buyAmount, sellPlanq);
        return buyAmount;
    }

    /**
     * @dev DEPRECATED - Use `buy` or `sell`.
     * @notice Exchanges a specific amount of one token for an unspecified amount
     * (greater than a threshold) of another.
     * @param sellAmount The number of tokens to send to the exchange.
     * @param minBuyAmount The minimum number of tokens for the exchange to send in return.
     * @param sellPlanq True if the caller is sending PLQ to the exchange, false otherwise.
     * @return The number of tokens sent by the exchange.
     * @dev The caller must first have approved `sellAmount` to the exchange.
     * @dev This function can be frozen via the Freezable interface.
     */
    function exchange(
        uint256 sellAmount,
        uint256 minBuyAmount,
        bool sellPlanq
    ) external returns (uint256) {
        return sell(sellAmount, minBuyAmount, sellPlanq);
    }

    /**
     * @notice Exchanges an unspecified amount (up to a threshold) of one token for
     * a specific amount of another.
     * @param buyAmount The number of tokens for the exchange to send in return.
     * @param maxSellAmount The maximum number of tokens to send to the exchange.
     * @param buyPlanq True if the exchange is sending PLQ to the caller, false otherwise.
     * @return The number of tokens sent to the exchange.
     * @dev The caller must first have approved `maxSellAmount` to the exchange.
     * @dev This function can be frozen via the Freezable interface.
     */
    function buy(
        uint256 buyAmount,
        uint256 maxSellAmount,
        bool buyPlanq
    ) external onlyWhenNotFrozen updateBucketsIfNecessary nonReentrant returns (uint256) {
        bool sellPlanq = !buyPlanq;
        (uint256 buyTokenBucket, uint256 sellTokenBucket) = _getBuyAndSellBuckets(sellPlanq);
        uint256 sellAmount = _getSellTokenAmount(buyTokenBucket, sellTokenBucket, buyAmount);

        require(sellAmount <= maxSellAmount, "Calculated sellAmount was greater than specified maxSellAmount");

        _exchange(sellAmount, buyAmount, sellPlanq);
        return sellAmount;
    }

    /**
     * @notice Exchanges a specific amount of one token for a specific amount of another.
     * @param sellAmount The number of tokens to send to the exchange.
     * @param buyAmount The number of tokens for the exchange to send in return.
     * @param sellPlanq True if the msg.sender is sending PLQ to the exchange, false otherwise.
     */
    function _exchange(
        uint256 sellAmount,
        uint256 buyAmount,
        bool sellPlanq
    ) private {
        IReserve reserve = IReserve(registry.getAddressForOrDie(RESERVE_REGISTRY_ID));

        if (sellPlanq) {
            planqBucket = planqBucket.add(sellAmount);
            stableBucket = stableBucket.sub(buyAmount);
            require(
                getPlanqToken().transferFrom(msg.sender, address(reserve), sellAmount),
                "Transfer of sell token failed"
            );
            require(IStableToken(stable).mint(msg.sender, buyAmount), "Mint of stable token failed");
        } else {
            stableBucket = stableBucket.add(sellAmount);
            planqBucket = planqBucket.sub(buyAmount);
            require(
                IERC20(stable).transferFrom(msg.sender, address(this), sellAmount),
                "Transfer of sell token failed"
            );
            IStableToken(stable).burn(sellAmount);

            require(reserve.transferExchangePlanq(msg.sender, buyAmount), "Transfer of buyToken failed");
        }

        emit Exchanged(msg.sender, sellAmount, buyAmount, sellPlanq);
    }

    /**
     * @notice Returns the amount of buy tokens a user would get for sellAmount of the sell token.
     * @param sellAmount The amount of sellToken the user is selling to the exchange.
     * @param sellPlanq `true` if planq is the sell token.
     * @return The corresponding buyToken amount.
     */
    function getBuyTokenAmount(uint256 sellAmount, bool sellPlanq) external view returns (uint256) {
        (uint256 buyTokenBucket, uint256 sellTokenBucket) = getBuyAndSellBuckets(sellPlanq);
        return _getBuyTokenAmount(buyTokenBucket, sellTokenBucket, sellAmount);
    }

    /**
     * @notice Returns the amount of sell tokens a user would need to exchange to receive buyAmount of
     * buy tokens.
     * @param buyAmount The amount of buyToken the user would like to purchase.
     * @param sellPlanq `true` if planq is the sell token.
     * @return The corresponding sellToken amount.
     */
    function getSellTokenAmount(uint256 buyAmount, bool sellPlanq) external view returns (uint256) {
        (uint256 buyTokenBucket, uint256 sellTokenBucket) = getBuyAndSellBuckets(sellPlanq);
        return _getSellTokenAmount(buyTokenBucket, sellTokenBucket, buyAmount);
    }

    /**
     * @notice Returns the buy token and sell token bucket sizes, in order. The ratio of
     * the two also represents the exchange rate between the two.
     * @param sellPlanq `true` if planq is the sell token.
     * @return buyTokenBucket
     * @return sellTokenBucket
     */
    function getBuyAndSellBuckets(bool sellPlanq) public view returns (uint256, uint256) {
        uint256 currentPlanqBucket = planqBucket;
        uint256 currentStableBucket = stableBucket;

        if (shouldUpdateBuckets()) {
            (currentPlanqBucket, currentStableBucket) = getUpdatedBuckets();
        }

        if (sellPlanq) {
            return (currentStableBucket, currentPlanqBucket);
        } else {
            return (currentPlanqBucket, currentStableBucket);
        }
    }

    /**
     * @notice Allows owner to set the update frequency
     * @param newUpdateFrequency The new update frequency
     */
    function setUpdateFrequency(uint256 newUpdateFrequency) public onlyOwner {
        updateFrequency = newUpdateFrequency;
        emit UpdateFrequencySet(newUpdateFrequency);
    }

    /**
     * @notice Allows owner to set the minimum number of reports required
     * @param newMininumReports The new update minimum number of reports required
     */
    function setMinimumReports(uint256 newMininumReports) public onlyOwner {
        minimumReports = newMininumReports;
        emit MinimumReportsSet(newMininumReports);
    }

    /**
     * @notice Allows owner to set the Stable Token address
     * @param newStableToken The new address for Stable Token
     */
    function setStableToken(address newStableToken) public onlyOwner {
        _setStableToken(newStableToken);
    }

    /**
     * @notice Allows owner to set the spread
     * @param newSpread The new value for the spread
     */
    function setSpread(uint256 newSpread) public onlyOwner {
        spread = FixidityLib.wrap(newSpread);
        require(FixidityLib.lte(spread, FixidityLib.fixed1()), "Spread must be less than or equal to 1");
        emit SpreadSet(newSpread);
    }

    /**
     * @notice Allows owner to set the Reserve Fraction
     * @param newReserveFraction The new value for the reserve fraction
     */
    function setReserveFraction(uint256 newReserveFraction) public onlyOwner {
        reserveFraction = FixidityLib.wrap(newReserveFraction);
        require(reserveFraction.lt(FixidityLib.fixed1()), "reserve fraction must be smaller than 1");
        emit ReserveFractionSet(newReserveFraction);
    }

    function _setStableToken(address newStableToken) internal {
        stable = newStableToken;
        emit StableTokenSet(newStableToken);
    }

    /**
     * @notice Returns the buy token and sell token bucket sizes, in order. The ratio of
     * the two also represents the exchange rate between the two.
     * @param sellPlanq `true` if planq is the sell token.
     * @return buyTokenBucket
     * @return sellTokenBucket
     */
    function _getBuyAndSellBuckets(bool sellPlanq) private view returns (uint256, uint256) {
        if (sellPlanq) {
            return (stableBucket, planqBucket);
        } else {
            return (planqBucket, stableBucket);
        }
    }

    /**
     * @dev Returns the amount of buy tokens a user would get for sellAmount of the sell.
     * @param buyTokenBucket The buy token bucket size.
     * @param sellTokenBucket The sell token bucket size.
     * @param sellAmount The amount the user is selling to the exchange.
     * @return The corresponding buy amount.
     */
    function _getBuyTokenAmount(
        uint256 buyTokenBucket,
        uint256 sellTokenBucket,
        uint256 sellAmount
    ) private view returns (uint256) {
        if (sellAmount == 0) return 0;

        FixidityLib.Fraction memory reducedSellAmount = getReducedSellAmount(sellAmount);
        FixidityLib.Fraction memory numerator = reducedSellAmount.multiply(FixidityLib.newFixed(buyTokenBucket));
        FixidityLib.Fraction memory denominator = FixidityLib.newFixed(sellTokenBucket).add(reducedSellAmount);

        // Can't use FixidityLib.divide because denominator can easily be greater
        // than maxFixedDivisor.
        // Fortunately, we expect an integer result, so integer division gives us as
        // much precision as we could hope for.
        return numerator.unwrap().div(denominator.unwrap());
    }

    /**
     * @notice Returns the amount of sell tokens a user would need to exchange to receive buyAmount of
     * buy tokens.
     * @param buyTokenBucket The buy token bucket size.
     * @param sellTokenBucket The sell token bucket size.
     * @param buyAmount The amount the user is buying from the exchange.
     * @return The corresponding sell amount.
     */
    function _getSellTokenAmount(
        uint256 buyTokenBucket,
        uint256 sellTokenBucket,
        uint256 buyAmount
    ) private view returns (uint256) {
        if (buyAmount == 0) return 0;

        FixidityLib.Fraction memory numerator = FixidityLib.newFixed(buyAmount.mul(sellTokenBucket));
        FixidityLib.Fraction memory denominator = FixidityLib.newFixed(buyTokenBucket.sub(buyAmount)).multiply(
            FixidityLib.fixed1().subtract(spread)
        );

        // See comment in _getBuyTokenAmount
        return numerator.unwrap().div(denominator.unwrap());
    }

    /**
     * @return buyTokenBucket
     * @return sellTokenBucket
     */
    function getUpdatedBuckets() private view returns (uint256, uint256) {
        uint256 updatedPlanqBucket = getUpdatedPlanqBucket();
        uint256 exchangeRateNumerator;
        uint256 exchangeRateDenominator;
        (exchangeRateNumerator, exchangeRateDenominator) = getOracleExchangeRate();
        uint256 updatedStableBucket = exchangeRateNumerator.mul(updatedPlanqBucket).div(exchangeRateDenominator);
        return (updatedPlanqBucket, updatedStableBucket);
    }

    function getUpdatedPlanqBucket() private view returns (uint256) {
        uint256 reservePlanqBalance = getReserve().getUnfrozenReservePlanqBalance();
        return reserveFraction.multiply(FixidityLib.newFixed(reservePlanqBalance)).fromFixed();
    }

    /**
     * @notice If conditions are met, updates the Uniswap bucket sizes to track
     * the price reported by the Oracle.
     */
    function _updateBucketsIfNecessary() private {
        if (shouldUpdateBuckets()) {
            // solhint-disable-next-line not-rely-on-time
            lastBucketUpdate = now;

            (planqBucket, stableBucket) = getUpdatedBuckets();
            emit BucketsUpdated(planqBucket, stableBucket);
        }
    }

    /**
     * @notice Calculates the sell amount reduced by the spread.
     * @param sellAmount The original sell amount.
     * @return The reduced sell amount, computed as (1 - spread) * sellAmount
     */
    function getReducedSellAmount(uint256 sellAmount) private view returns (FixidityLib.Fraction memory) {
        return FixidityLib.fixed1().subtract(spread).multiply(FixidityLib.newFixed(sellAmount));
    }

    /**
     * @notice Checks conditions required for bucket updates.
     * @return The Rate numerator - whether or not buckets should be updated.
     * @return The rate denominator - whether or not buckets should be updated.
     */
    function shouldUpdateBuckets() private view returns (bool) {
        ISortedOracles sortedOracles = ISortedOracles(registry.getAddressForOrDie(SORTED_ORACLES_REGISTRY_ID));
        (bool isReportExpired, ) = sortedOracles.isOldestReportExpired(stable);
        // solhint-disable-next-line not-rely-on-time
        bool timePassed = now >= lastBucketUpdate.add(updateFrequency);
        bool enoughReports = sortedOracles.numRates(stable) >= minimumReports;
        // solhint-disable-next-line not-rely-on-time
        bool medianReportRecent = sortedOracles.medianTimestamp(stable) > now.sub(updateFrequency);
        return timePassed && enoughReports && medianReportRecent && !isReportExpired;
    }

    function getOracleExchangeRate() private view returns (uint256, uint256) {
        uint256 rateNumerator;
        uint256 rateDenominator;
        (rateNumerator, rateDenominator) = ISortedOracles(registry.getAddressForOrDie(SORTED_ORACLES_REGISTRY_ID))
            .medianRate(stable);
        require(rateDenominator > 0, "exchange rate denominator must be greater than 0");
        return (rateNumerator, rateDenominator);
    }
}
