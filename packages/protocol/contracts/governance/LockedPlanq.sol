pragma solidity ^0.5.13;

import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/utils/Address.sol";

import "./interfaces/ILockedPlanq.sol";

import "../common/Initializable.sol";
import "../common/Signatures.sol";
import "../common/UsingRegistry.sol";
import "../common/interfaces/IPlanqVersionedContract.sol";
import "../common/libraries/ReentrancyGuard.sol";

contract LockedPlanq is
    ILockedPlanq,
    IPlanqVersionedContract,
    ReentrancyGuard,
    Initializable,
    UsingRegistry
{
    using SafeMath for uint256;
    using Address for address payable; // prettier-ignore

    struct PendingWithdrawal {
        // The value of the pending withdrawal.
        uint256 value;
        // The timestamp at which the pending withdrawal becomes available.
        uint256 timestamp;
    }

    // NOTE: This contract does not store an account's locked planq that is being used in electing
    // validators.
    struct Balances {
        // The amount of locked planq that this account has that is not currently participating in
        // validator elections.
        uint256 nonvoting;
        // Planq that has been unlocked and will become available for withdrawal.
        PendingWithdrawal[] pendingWithdrawals;
    }

    mapping(address => Balances) internal balances;

    // Iterable map to store whitelisted identifiers.
    // Necessary to allow iterating over whitelisted IDs to check ID's address at runtime.
    mapping(bytes32 => bool) internal slashingMap;
    bytes32[] public slashingWhitelist;

    modifier onlySlasher {
        require(
            registry.isOneOf(slashingWhitelist, msg.sender),
            "Caller is not a whitelisted slasher."
        );
        _;
    }

    function isSlasher(address slasher) external view returns (bool) {
        return (registry.isOneOf(slashingWhitelist, slasher));
    }

    uint256 public totalNonvoting;
    uint256 public unlockingPeriod;

    event UnlockingPeriodSet(uint256 period);
    event PlanqLocked(address indexed account, uint256 value);
    event PlanqUnlocked(
        address indexed account,
        uint256 value,
        uint256 available
    );
    event PlanqRelocked(address indexed account, uint256 value);
    event PlanqWithdrawn(address indexed account, uint256 value);
    event SlasherWhitelistAdded(string indexed slasherIdentifier);
    event SlasherWhitelistRemoved(string indexed slasherIdentifier);
    event AccountSlashed(
        address indexed slashed,
        uint256 penalty,
        address indexed reporter,
        uint256 reward
    );

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
        returns (uint256, uint256, uint256, uint256)
    {
        return (1, 1, 3, 0);
    }

    /**
   * @notice Sets initialized == true on implementation contracts
   * @param test Set to true to skip implementation initialization
   */
    constructor(bool test) public Initializable(test) {}

    /**
   * @notice Used in place of the constructor to allow the contract to be upgradable via proxy.
   * @param registryAddress The address of the registry core smart contract.
   * @param _unlockingPeriod The unlocking period in seconds.
   */
    function initialize(address registryAddress, uint256 _unlockingPeriod)
        external
        initializer
    {
        _transferOwnership(msg.sender);
        setRegistry(registryAddress);
        setUnlockingPeriod(_unlockingPeriod);
    }

    /**
   * @notice Sets the duration in seconds users must wait before withdrawing planq after unlocking.
   * @param value The unlocking period in seconds.
   */
    function setUnlockingPeriod(uint256 value) public onlyOwner {
        require(value != unlockingPeriod, "Unlocking period not changed");
        unlockingPeriod = value;
        emit UnlockingPeriodSet(value);
    }

    /**
   * @notice Locks planq to be used for voting.
   */
    function lock() external payable nonReentrant {
        require(
            getAccounts().isAccount(msg.sender),
            "Must first register address with Account.createAccount"
        );
        _incrementNonvotingAccountBalance(msg.sender, msg.value);
        emit PlanqLocked(msg.sender, msg.value);
    }

    /**
   * @notice Increments the non-voting balance for an account.
   * @param account The account whose non-voting balance should be incremented.
   * @param value The amount by which to increment.
   * @dev Can only be called by the registered Election smart contract.
   */
    function incrementNonvotingAccountBalance(address account, uint256 value)
        external
        onlyRegisteredContract(ELECTION_REGISTRY_ID)
    {
        _incrementNonvotingAccountBalance(account, value);
    }

    /**
   * @notice Decrements the non-voting balance for an account.
   * @param account The account whose non-voting balance should be decremented.
   * @param value The amount by which to decrement.
   * @dev Can only be called by the registered "Election" smart contract.
   */
    function decrementNonvotingAccountBalance(address account, uint256 value)
        external
        onlyRegisteredContract(ELECTION_REGISTRY_ID)
    {
        _decrementNonvotingAccountBalance(account, value);
    }

    /**
   * @notice Increments the non-voting balance for an account.
   * @param account The account whose non-voting balance should be incremented.
   * @param value The amount by which to increment.
   */
    function _incrementNonvotingAccountBalance(address account, uint256 value)
        private
    {
        balances[account].nonvoting = balances[account].nonvoting.add(value);
        totalNonvoting = totalNonvoting.add(value);
    }

    /**
   * @notice Decrements the non-voting balance for an account.
   * @param account The account whose non-voting balance should be decremented.
   * @param value The amount by which to decrement.
   */
    function _decrementNonvotingAccountBalance(address account, uint256 value)
        private
    {
        balances[account].nonvoting = balances[account].nonvoting.sub(value);
        totalNonvoting = totalNonvoting.sub(value);
    }

    /**
   * @notice Unlocks planq that becomes withdrawable after the unlocking period.
   * @param value The amount of planq to unlock.
   */
    function unlock(uint256 value) external nonReentrant {
        require(
            getAccounts().isAccount(msg.sender),
            "Sender must be registered with Account.createAccount to lock or unlock"
        );
        Balances storage account = balances[msg.sender];
        // Prevent unlocking planq when voting on governance proposals so that the planq cannot be
        // used to vote more than once.
        uint256 remainingLockedPlanq = getAccountTotalLockedPlanq(msg.sender)
            .sub(value);

        uint256 totalReferendumVotes = getGovernance()
            .getAmountOfPlanqUsedForVoting(msg.sender);
        require(
            remainingLockedPlanq >= totalReferendumVotes,
            "Not enough unlockable planq. Planq is locked in voting."
        );

        uint256 balanceRequirement = getValidators()
            .getAccountLockedPlanqRequirement(msg.sender);
        require(
            balanceRequirement == 0 ||
                balanceRequirement <= remainingLockedPlanq,
            "Either account doesn't have enough locked Planq or locked Planq is being used for voting."
        );
        _decrementNonvotingAccountBalance(msg.sender, value);
        uint256 available = now.add(unlockingPeriod);
        // CERTORA: the slot containing the length could be MAX_UINT
        account.pendingWithdrawals.push(PendingWithdrawal(value, available));
        emit PlanqUnlocked(msg.sender, value, available);
    }

    /**
   * @notice Relocks planq that has been unlocked but not withdrawn.
   * @param index The index of the pending withdrawal to relock from.
   * @param value The value to relock from the specified pending withdrawal.
   */
    function relock(uint256 index, uint256 value) external nonReentrant {
        require(
            getAccounts().isAccount(msg.sender),
            "Sender must be registered with Account.createAccount to lock or relock"
        );
        Balances storage account = balances[msg.sender];
        require(
            index < account.pendingWithdrawals.length,
            "Bad pending withdrawal index"
        );
        PendingWithdrawal storage pendingWithdrawal = account
            .pendingWithdrawals[index];
        require(
            value <= pendingWithdrawal.value,
            "Requested value larger than pending value"
        );
        if (value == pendingWithdrawal.value) {
            deletePendingWithdrawal(account.pendingWithdrawals, index);
        } else {
            pendingWithdrawal.value = pendingWithdrawal.value.sub(value);
        }
        _incrementNonvotingAccountBalance(msg.sender, value);
        emit PlanqRelocked(msg.sender, value);
    }

    /**
   * @notice Withdraws planq that has been unlocked after the unlocking period has passed.
   * @param index The index of the pending withdrawal to withdraw.
   */
    function withdraw(uint256 index) external nonReentrant {
        require(
            getAccounts().isAccount(msg.sender),
            "Sender must be registered with Account.createAccount to withdraw"
        );
        Balances storage account = balances[msg.sender];
        require(
            index < account.pendingWithdrawals.length,
            "Bad pending withdrawal index"
        );
        PendingWithdrawal storage pendingWithdrawal = account
            .pendingWithdrawals[index];
        require(
            now >= pendingWithdrawal.timestamp,
            "Pending withdrawal not available"
        );
        uint256 value = pendingWithdrawal.value;
        deletePendingWithdrawal(account.pendingWithdrawals, index);
        require(value <= address(this).balance, "Inconsistent balance");
        msg.sender.sendValue(value);
        emit PlanqWithdrawn(msg.sender, value);
    }

    /**
   * @notice Returns the total amount of locked planq in the system. Note that this does not include
   *   planq that has been unlocked but not yet withdrawn.
   * @return The total amount of locked planq in the system.
   */
    function getTotalLockedPlanq() external view returns (uint256) {
        return totalNonvoting.add(getElection().getTotalVotes());
    }

    /**
   * @notice Returns the total amount of locked planq not being used to vote in elections.
   * @return The total amount of locked planq not being used to vote in elections.
   */
    function getNonvotingLockedPlanq() external view returns (uint256) {
        return totalNonvoting;
    }

    /**
   * @notice Returns the total amount of locked planq for an account.
   * @param account The account.
   * @return The total amount of locked planq for an account.
   */
    function getAccountTotalLockedPlanq(address account)
        public
        view
        returns (uint256)
    {
        uint256 total = balances[account].nonvoting;
        return total.add(getElection().getTotalVotesByAccount(account));
    }

    /**
   * @notice Returns the total amount of non-voting locked planq for an account.
   * @param account The account.
   * @return The total amount of non-voting locked planq for an account.
   */
    function getAccountNonvotingLockedPlanq(address account)
        external
        view
        returns (uint256)
    {
        return balances[account].nonvoting;
    }

    /**
   * @notice Returns the pending withdrawals from unlocked planq for an account.
   * @param account The address of the account.
   * @return The value for each pending withdrawal.
   * @return The timestamp for each pending withdrawal.
   */
    function getPendingWithdrawals(address account)
        external
        view
        returns (uint256[] memory, uint256[] memory)
    {
        require(
            getAccounts().isAccount(account),
            "Unknown account: only registered accounts have pending withdrawals"
        );
        uint256 length = balances[account].pendingWithdrawals.length;
        uint256[] memory values = new uint256[](length);
        uint256[] memory timestamps = new uint256[](length);
        for (uint256 i = 0; i < length; i = i.add(1)) {
            PendingWithdrawal memory pendingWithdrawal = (
                balances[account].pendingWithdrawals[i]
            );
            values[i] = pendingWithdrawal.value;
            timestamps[i] = pendingWithdrawal.timestamp;
        }
        return (values, timestamps);
    }

    /**
   * @notice Returns the pending withdrawal at a given index for a given account.
   * @param account The address of the account.
   * @param index The index of the pending withdrawal.
   * @return The value of the pending withdrawal.
   * @return The timestamp of the pending withdrawal.
   */
    function getPendingWithdrawal(address account, uint256 index)
        external
        view
        returns (uint256, uint256)
    {
        require(
            getAccounts().isAccount(account),
            "Unknown account: only registered accounts have pending withdrawals"
        );
        require(
            index < balances[account].pendingWithdrawals.length,
            "Bad pending withdrawal index"
        );
        PendingWithdrawal memory pendingWithdrawal = (
            balances[account].pendingWithdrawals[index]
        );

        return (pendingWithdrawal.value, pendingWithdrawal.timestamp);
    }

    /**
    * @notice Returns the number of pending withdrawals for the specified account.
    * @param account The address of the account.
    * @return The count of pending withdrawals.
    */
    function getTotalPendingWithdrawalsCount(address account)
        external
        view
        returns (uint256)
    {
        return balances[account].pendingWithdrawals.length;
    }

    /**
   * @notice Returns the total amount to withdraw from unlocked planq for an account.
   * @param account The address of the account.
   * @return Total amount to withdraw.
   */
    function getTotalPendingWithdrawals(address account)
        external
        view
        returns (uint256)
    {
        uint256 pendingWithdrawalSum = 0;
        PendingWithdrawal[] memory withdrawals = balances[account]
            .pendingWithdrawals;
        for (uint256 i = 0; i < withdrawals.length; i = i.add(1)) {
            pendingWithdrawalSum = pendingWithdrawalSum.add(
                withdrawals[i].value
            );
        }
        return pendingWithdrawalSum;
    }

    function getSlashingWhitelist() external view returns (bytes32[] memory) {
        return slashingWhitelist;
    }

    /**
   * @notice Deletes a pending withdrawal.
   * @param list The list of pending withdrawals from which to delete.
   * @param index The index of the pending withdrawal to delete.
   */
    function deletePendingWithdrawal(
        PendingWithdrawal[] storage list,
        uint256 index
    ) private {
        uint256 lastIndex = list.length.sub(1);
        list[index] = list[lastIndex];
        list.length = lastIndex;
    }

    /**
   * @notice Adds `slasher` to whitelist of approved slashing addresses.
   * @param slasherIdentifier Identifier to whitelist.
   */
    function addSlasher(string calldata slasherIdentifier) external onlyOwner {
        bytes32 keyBytes = keccak256(abi.encodePacked(slasherIdentifier));
        require(
            registry.getAddressFor(keyBytes) != address(0),
            "Identifier is not registered"
        );
        require(!slashingMap[keyBytes], "Cannot add slasher ID twice.");
        slashingWhitelist.push(keyBytes);
        slashingMap[keyBytes] = true;
        emit SlasherWhitelistAdded(slasherIdentifier);
    }

    /**
   * @notice Removes `slasher` from whitelist of approved slashing addresses.
   * @param slasherIdentifier Identifier to remove from whitelist.
   * @param index Index of the provided identifier in slashingWhiteList array.
   */
    function removeSlasher(string calldata slasherIdentifier, uint256 index)
        external
        onlyOwner
    {
        bytes32 keyBytes = keccak256(abi.encodePacked(slasherIdentifier));
        require(
            slashingMap[keyBytes],
            "Cannot remove slasher ID not yet added."
        );
        require(
            index < slashingWhitelist.length,
            "Provided index exceeds whitelist bounds."
        );
        require(
            slashingWhitelist[index] == keyBytes,
            "Index doesn't match identifier"
        );
        slashingWhitelist[index] = slashingWhitelist[slashingWhitelist.length -
            1];
        slashingWhitelist.pop();
        slashingMap[keyBytes] = false;
        emit SlasherWhitelistRemoved(slasherIdentifier);
    }

    /**
   * @notice Slashes `account` by reducing its nonvoting locked planq by `penalty`.
   *         If there is not enough nonvoting locked planq to slash, calls into
   *         `Election.slashVotes` to slash the remaining planq. If `account` does not have
   *         `penalty` worth of locked planq, slashes `account`'s total locked planq.
   *         Also sends `reward` planq to the reporter, and penalty-reward to the Community Fund.
   * @param account Address of account being slashed.
   * @param penalty Amount to slash account.
   * @param reporter Address of account reporting the slasher.
   * @param reward Reward to give reporter.
   * @param lessers The groups receiving fewer votes than i'th group, or 0 if the i'th group has
   *                the fewest votes of any validator group.
   * @param greaters The groups receiving more votes than the i'th group, or 0 if the i'th group
   *                 has the most votes of any validator group.
   * @param indices The indices of the i'th group in `account`'s voting list.
   * @dev Fails if `reward` is greater than `account`'s total locked planq.
   */
    function slash(
        address account,
        uint256 penalty,
        address reporter,
        uint256 reward,
        address[] calldata lessers,
        address[] calldata greaters,
        uint256[] calldata indices
    ) external onlySlasher {
        uint256 maxSlash = Math.min(
            penalty,
            getAccountTotalLockedPlanq(account)
        );
        require(maxSlash >= reward, "reward cannot exceed penalty.");
        // `reporter` receives the reward in locked PLQ, so it must be given to an account
        // There is no reward for slashing via the GovernanceSlasher, and `reporter`
        // is set to 0x0.
        if (reporter != address(0)) {
            reporter = getAccounts().signerToAccount(reporter);
        }
        // Local scoping is required to avoid Solc "stack too deep" error from too many locals.
        {
            uint256 nonvotingBalance = balances[account].nonvoting;
            uint256 difference = 0;
            // If not enough nonvoting, revoke the difference
            if (nonvotingBalance < maxSlash) {
                difference = maxSlash.sub(nonvotingBalance);
                require(
                    getElection().forceDecrementVotes(
                        account,
                        difference,
                        lessers,
                        greaters,
                        indices
                    ) ==
                        difference,
                    "Cannot revoke enough voting planq."
                );
            }
            // forceDecrementVotes does not increment nonvoting account balance, so we can't double count
            _decrementNonvotingAccountBalance(
                account,
                maxSlash.sub(difference)
            );
            _incrementNonvotingAccountBalance(reporter, reward);
        }
        address communityFund = registry.getAddressForOrDie(
            GOVERNANCE_REGISTRY_ID
        );
        address payable communityFundPayable = address(uint160(communityFund));
        require(
            maxSlash.sub(reward) <= address(this).balance,
            "Inconsistent balance"
        );
        communityFundPayable.sendValue(maxSlash.sub(reward));
        emit AccountSlashed(account, maxSlash, reporter, reward);
    }
}
