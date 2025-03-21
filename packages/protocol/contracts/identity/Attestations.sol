pragma solidity ^0.5.13;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/utils/SafeCast.sol";

import "./interfaces/IAttestations.sol";
import "../common/interfaces/IAccounts.sol";
import "../common/interfaces/IPlanqVersionedContract.sol";

import "../common/Initializable.sol";
import "../common/UsingRegistry.sol";
import "../common/Signatures.sol";
import "../common/UsingPrecompiles.sol";
import "../common/libraries/ReentrancyGuard.sol";

/**
 * @title Contract mapping identifiers to accounts
 */
contract Attestations is
  IAttestations,
  IPlanqVersionedContract,
  Ownable,
  Initializable,
  UsingRegistry,
  ReentrancyGuard,
  UsingPrecompiles
{
  using SafeMath for uint256;
  using SafeCast for uint256;

  enum AttestationStatus { None, Incomplete, Complete }

  struct Attestation {
    AttestationStatus status;
    // For outstanding attestations, this is the block number of the request.
    // For completed attestations, this is the block number of the attestation completion.
    uint32 blockNumber;
    // The token with which attestation request fees were paid.
    address attestationRequestFeeToken;
  }

  // Stores attestations state for a single (identifier, account address) pair.
  struct AttestedAddress {
    // Total number of requested attestations.
    uint32 requested;
    // Total number of completed attestations.
    uint32 completed;
    // List of selected issuers responsible for attestations. The length of this list
    // might be smaller than `requested` (which represents the total number of requested
    // attestations) if users are not calling `selectIssuers` on unselected requests.
    address[] selectedIssuers;
    // State of each attestation keyed by issuer.
    mapping(address => Attestation) issuedAttestations;
  }

  struct UnselectedRequest {
    // The block at which the attestations were requested.
    uint32 blockNumber;
    // The number of attestations that were requested.
    uint32 attestationsRequested;
    // The token with which attestation request fees were paid in this request.
    address attestationRequestFeeToken;
  }

  struct IdentifierState {
    // All account addresses associated with this identifier.
    address[] accounts;
    // Keeps the state of attestations for account addresses for this identifier.
    mapping(address => AttestedAddress) attestations;
    // Temporarily stores attestation requests for which issuers should be selected by the account.
    mapping(address => UnselectedRequest) unselectedRequests;
  }

  mapping(bytes32 => IdentifierState) identifiers;

  // The duration in blocks in which an attestation can be completed from the block in which the
  // attestation was requested.
  uint256 public attestationExpiryBlocks;

  // The duration to wait until selectIssuers can be called for an attestation request.
  uint256 public selectIssuersWaitBlocks;

  // Limit the maximum number of attestations that can be requested
  uint256 public maxAttestations;

  // The fees that are associated with attestations for a particular token.
  mapping(address => uint256) public attestationRequestFees;

  // Maps a token and attestation issuer to the amount that they're owed.
  mapping(address => mapping(address => uint256)) public pendingWithdrawals;

  // Attestation transfer approvals, keyed by user and keccak(identifier, from, to)
  mapping(address => mapping(bytes32 => bool)) public transferApprovals;

  event AttestationsRequested(
    bytes32 indexed identifier,
    address indexed account,
    uint256 attestationsRequested,
    address attestationRequestFeeToken
  );

  event AttestationIssuerSelected(
    bytes32 indexed identifier,
    address indexed account,
    address indexed issuer,
    address attestationRequestFeeToken
  );

  event AttestationCompleted(
    bytes32 indexed identifier,
    address indexed account,
    address indexed issuer
  );

  event Withdrawal(address indexed account, address indexed token, uint256 amount);
  event AttestationExpiryBlocksSet(uint256 value);
  event AttestationRequestFeeSet(address indexed token, uint256 value);
  event SelectIssuersWaitBlocksSet(uint256 value);
  event MaxAttestationsSet(uint256 value);
  event AttestationsTransferred(
    bytes32 indexed identifier,
    address indexed fromAccount,
    address indexed toAccount
  );
  event TransferApproval(
    address indexed approver,
    bytes32 indexed indentifier,
    address from,
    address to,
    bool approved
  );

  /**
   * @notice Sets initialized == true on implementation contracts
   * @param test Set to true to skip implementation initialization
   */
  constructor(bool test) public Initializable(test) {}

  /**
   * @notice Used in place of the constructor to allow the contract to be upgradable via proxy.
   * @param registryAddress The address of the registry core smart contract.
   * @param _attestationExpiryBlocks The new limit on blocks allowed to come between requesting
   * an attestation and completing it.
   * @param _selectIssuersWaitBlocks The wait period in blocks to call selectIssuers on attestation
   * requests.
   * @param attestationRequestFeeTokens The address of tokens that fees should be payable in.
   * @param attestationRequestFeeValues The corresponding fee values.
   */
  function initialize(
    address registryAddress,
    uint256 _attestationExpiryBlocks,
    uint256 _selectIssuersWaitBlocks,
    uint256 _maxAttestations,
    address[] calldata attestationRequestFeeTokens,
    uint256[] calldata attestationRequestFeeValues
  ) external initializer {
    _transferOwnership(msg.sender);
    setRegistry(registryAddress);
    setAttestationExpiryBlocks(_attestationExpiryBlocks);
    setSelectIssuersWaitBlocks(_selectIssuersWaitBlocks);
    setMaxAttestations(_maxAttestations);

    require(
      attestationRequestFeeTokens.length > 0 &&
        attestationRequestFeeTokens.length == attestationRequestFeeValues.length,
      "attestationRequestFeeTokens specification was invalid"
    );
    for (uint256 i = 0; i < attestationRequestFeeTokens.length; i = i.add(1)) {
      setAttestationRequestFee(attestationRequestFeeTokens[i], attestationRequestFeeValues[i]);
    }
  }

  /**
   * @notice Returns the storage, major, minor, and patch version of the contract.
   * @return Storage version of the contract.
   * @return Major version of the contract.
   * @return Minor version of the contract.
   * @return Patch version of the contract.
   */
  function getVersionNumber() external pure returns (uint256, uint256, uint256, uint256) {
    return (1, 2, 0, 0);
  }

  /**
   * @notice Revokes an account for an identifier.
   * @param identifier The identifier for which to revoke.
   * @param index The index of the account in the accounts array.
   */
  function revoke(bytes32 identifier, uint256 index) external {
    uint256 numAccounts = identifiers[identifier].accounts.length;
    require(index < numAccounts, "Index is invalid");
    require(
      msg.sender == identifiers[identifier].accounts[index],
      "Index does not match msg.sender"
    );

    uint256 newNumAccounts = numAccounts.sub(1);
    if (index != newNumAccounts) {
      identifiers[identifier].accounts[index] = identifiers[identifier].accounts[newNumAccounts];
    }
    identifiers[identifier].accounts[newNumAccounts] = address(0x0);
    identifiers[identifier].accounts.length = identifiers[identifier].accounts.length.sub(1);
  }

  /**
   * @notice Allows issuers to withdraw accumulated attestation rewards.
   * @param token The address of the token that will be withdrawn.
   * @dev Throws if msg.sender does not have any rewards to withdraw.
   */
  function withdraw(address token) external {
    address issuer = getAccounts().attestationSignerToAccount(msg.sender);
    uint256 value = pendingWithdrawals[token][issuer];
    require(value > 0, "value was negative/zero");
    pendingWithdrawals[token][issuer] = 0;
    require(IERC20(token).transfer(issuer, value), "token transfer failed");
    emit Withdrawal(issuer, token, value);
  }

  /**
   * @notice Returns the unselected attestation request for an identifier/account pair, if any.
   * @param identifier Hash of the identifier.
   * @param account Address of the account.
   * @return block Block number at which was requested.
   * @return number Number of unselected requests.
   * @return address Address of the token with which this attestation request was paid for.
   */
  function getUnselectedRequest(bytes32 identifier, address account)
    external
    view
    returns (uint32, uint32, address)
  {
    return (
      identifiers[identifier].unselectedRequests[account].blockNumber,
      identifiers[identifier].unselectedRequests[account].attestationsRequested,
      identifiers[identifier].unselectedRequests[account].attestationRequestFeeToken
    );
  }

  /**
   * @notice Returns selected attestation issuers for a identifier/account pair.
   * @param identifier Hash of the identifier.
   * @param account Address of the account.
   * @return Addresses of the selected attestation issuers.
   */
  function getAttestationIssuers(bytes32 identifier, address account)
    external
    view
    returns (address[] memory)
  {
    return identifiers[identifier].attestations[account].selectedIssuers;
  }

  /**
   * @notice Returns attestation stats for a identifier/account pair.
   * @param identifier Hash of the identifier.
   * @param account Address of the account.
   * @return completed Number of completed attestations.
   * @return requested Number of total requested attestations.
   */
  function getAttestationStats(bytes32 identifier, address account)
    external
    view
    returns (uint32, uint32)
  {
    return (
      identifiers[identifier].attestations[account].completed,
      identifiers[identifier].attestations[account].requested
    );
  }

  /**
   * @notice Batch lookup function to determine attestation stats for a list of identifiers.
   * @param identifiersToLookup Array of n identifiers.
   * @return [0] Array of number of matching accounts per identifier.
   * @return [1] Array of sum([0]) matching walletAddresses.
   * @return [2] Array of sum([0]) numbers indicating the completions for each account.
   * @return [3] Array of sum([0]) numbers indicating the total number of requested
                 attestations for each account.
   */
  function batchGetAttestationStats(bytes32[] calldata identifiersToLookup)
    external
    view
    returns (uint256[] memory, address[] memory, uint64[] memory, uint64[] memory)
  {
    require(identifiersToLookup.length > 0, "You have to pass at least one identifier");

    uint256[] memory matches;
    address[] memory addresses;

    (matches, addresses) = batchlookupAccountsForIdentifier(identifiersToLookup);

    uint64[] memory completed = new uint64[](addresses.length);
    uint64[] memory total = new uint64[](addresses.length);

    uint256 currentIndex = 0;
    for (uint256 i = 0; i < identifiersToLookup.length; i = i.add(1)) {
      address[] memory addrs = identifiers[identifiersToLookup[i]].accounts;
      for (uint256 matchIndex = 0; matchIndex < matches[i]; matchIndex = matchIndex.add(1)) {
        addresses[currentIndex] = getAccounts().getWalletAddress(addrs[matchIndex]);
        completed[currentIndex] = identifiers[identifiersToLookup[i]]
          .attestations[addrs[matchIndex]]
          .completed;
        total[currentIndex] = identifiers[identifiersToLookup[i]].attestations[addrs[matchIndex]]
          .requested;
        currentIndex = currentIndex.add(1);
      }
    }

    return (matches, addresses, completed, total);
  }

  /**
   * @notice Returns the state of a specific attestation.
   * @param identifier Hash of the identifier.
   * @param account Address of the account.
   * @param issuer Address of the issuer.
   * @return status Status of the attestation.
   * @return block Block number of request/completion the attestation.
   * @return address Address of the token with which this attestation request was paid for.
   */
  function getAttestationState(bytes32 identifier, address account, address issuer)
    external
    view
    returns (uint8, uint32, address)
  {
    Attestation storage attestation = identifiers[identifier].attestations[account]
      .issuedAttestations[issuer];
    return (
      uint8(attestation.status),
      attestation.blockNumber,
      attestation.attestationRequestFeeToken
    );

  }

  /**
    * @notice Returns the state of all attestations that are completable
    * @param identifier Hash of the identifier.
    * @param account Address of the account.
    * @return Block number of request/completion the attestation.
    * @return Address of the issuer.
    * @return The length of each metadataURL string for each issuer.
    * @return All strings concatenated.
    */
  function getCompletableAttestations(bytes32 identifier, address account)
    external
    view
    returns (uint32[] memory, address[] memory, uint256[] memory, bytes memory)
  {
    AttestedAddress storage state = identifiers[identifier].attestations[account];
    address[] storage issuers = state.selectedIssuers;

    uint256 num = 0;
    for (uint256 i = 0; i < issuers.length; i = i.add(1)) {
      if (isAttestationCompletable(state.issuedAttestations[issuers[i]])) {
        num = num.add(1);
      }
    }

    uint32[] memory blockNumbers = new uint32[](num);
    address[] memory completableIssuers = new address[](num);

    uint256 pointer = 0;
    for (uint256 i = 0; i < issuers.length; i = i.add(1)) {
      if (isAttestationCompletable(state.issuedAttestations[issuers[i]])) {
        blockNumbers[pointer] = state.issuedAttestations[issuers[i]].blockNumber;
        completableIssuers[pointer] = issuers[i];
        pointer = pointer.add(1);
      }
    }

    uint256[] memory stringLengths;
    bytes memory stringData;
    (stringLengths, stringData) = getAccounts().batchGetMetadataURL(completableIssuers);
    return (blockNumbers, completableIssuers, stringLengths, stringData);
  }

  /**
   * @notice Returns the fee set for a particular token.
   * @param token Address of the attestationRequestFeeToken.
   * @return The fee.
   */
  function getAttestationRequestFee(address token) external view returns (uint256) {
    return attestationRequestFees[token];
  }

  /**
   * @notice Updates the fee  for a particular token.
   * @param token The address of the attestationRequestFeeToken.
   * @param fee The fee in 'token' that is required for each attestation.
   */
  function setAttestationRequestFee(address token, uint256 fee) public onlyOwner {
    require(fee > 0, "You have to specify a fee greater than 0");
    attestationRequestFees[token] = fee;
    emit AttestationRequestFeeSet(token, fee);
  }

  /**
   * @notice Updates 'attestationExpiryBlocks'.
   * @param _attestationExpiryBlocks The new limit on blocks allowed to come between requesting
   * an attestation and completing it.
   */
  function setAttestationExpiryBlocks(uint256 _attestationExpiryBlocks) public onlyOwner {
    require(_attestationExpiryBlocks > 0, "attestationExpiryBlocks has to be greater than 0");
    attestationExpiryBlocks = _attestationExpiryBlocks;
    emit AttestationExpiryBlocksSet(_attestationExpiryBlocks);
  }

  /**
   * @notice Updates 'selectIssuersWaitBlocks'.
   * @param _selectIssuersWaitBlocks The wait period in blocks to call selectIssuers on attestation
   *                                 requests.
   */
  function setSelectIssuersWaitBlocks(uint256 _selectIssuersWaitBlocks) public onlyOwner {
    require(_selectIssuersWaitBlocks > 0, "selectIssuersWaitBlocks has to be greater than 0");
    selectIssuersWaitBlocks = _selectIssuersWaitBlocks;
    emit SelectIssuersWaitBlocksSet(_selectIssuersWaitBlocks);
  }

  /**
   * @notice Updates 'maxAttestations'.
   * @param _maxAttestations Maximum number of attestations that can be requested.
   */
  function setMaxAttestations(uint256 _maxAttestations) public onlyOwner {
    require(_maxAttestations > 0, "maxAttestations has to be greater than 0");
    maxAttestations = _maxAttestations;
    emit MaxAttestationsSet(_maxAttestations);
  }

  /**
   * @notice Query 'maxAttestations'
   * @return Maximum number of attestations that can be requested.
   */
  function getMaxAttestations() external view returns (uint256) {
    return maxAttestations;
  }

  /**
   * @notice Validates the given attestation code.
   * @param identifier The hash of the identifier to be attested.
   * @param account Address of the account.
   * @param v The recovery id of the incoming ECDSA signature.
   * @param r Output value r of the ECDSA signature.
   * @param s Output value s of the ECDSA signature.
   * @return The issuer of the corresponding attestation.
   * @dev Throws if there is no matching outstanding attestation request.
   * @dev Throws if the attestation window has passed.
   */
  function validateAttestationCode(
    bytes32 identifier,
    address account,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public view returns (address) {
    bytes32 codehash = keccak256(abi.encodePacked(identifier, account));
    address signer = Signatures.getSignerOfMessageHash(codehash, v, r, s);
    address issuer = getAccounts().attestationSignerToAccount(signer);

    Attestation storage attestation = identifiers[identifier].attestations[account]
      .issuedAttestations[issuer];

    require(
      attestation.status == AttestationStatus.Incomplete,
      "Attestation code does not match any outstanding attestation"
    );
    require(!isAttestationExpired(attestation.blockNumber), "Attestation timed out");

    return issuer;
  }

  function lookupAccountsForIdentifier(bytes32 identifier)
    external
    view
    returns (address[] memory)
  {
    return identifiers[identifier].accounts;
  }

  /**
   * @notice Require that a given identifier/address pair has
   * requested a specific number of attestations.
   * @param identifier Hash of the identifier.
   * @param account Address of the account.
   * @param expected Number of expected attestations
   * @dev It can be used when batching meta-transactions to validate
   * attestation are requested as expected in untrusted scenarios
   */
  function requireNAttestationsRequested(bytes32 identifier, address account, uint32 expected)
    external
    view
  {
    uint256 requested = identifiers[identifier].attestations[account].requested;
    require(requested == expected, "requested attestations does not match expected");
  }

  /**
   * @notice Helper function for batchGetAttestationStats to calculate the
             total number of addresses that have >0 complete attestations for the identifiers.
   * @param identifiersToLookup Array of n identifiers.
   * @return Array of numbers that indicate the number of matching addresses per identifier.
   * @return Array of addresses preallocated for total number of matches.
   */
  function batchlookupAccountsForIdentifier(bytes32[] memory identifiersToLookup)
    internal
    view
    returns (uint256[] memory, address[] memory)
  {
    require(identifiersToLookup.length > 0, "You have to pass at least one identifier");
    uint256 totalAddresses = 0;
    uint256[] memory matches = new uint256[](identifiersToLookup.length);

    for (uint256 i = 0; i < identifiersToLookup.length; i = i.add(1)) {
      uint256 count = identifiers[identifiersToLookup[i]].accounts.length;

      totalAddresses = totalAddresses.add(count);
      matches[i] = count;
    }

    return (matches, new address[](totalAddresses));
  }

  function isAttestationExpired(uint32 attestationRequestBlock) internal view returns (bool) {
    return block.number >= uint256(attestationRequestBlock).add(attestationExpiryBlocks);
  }

  function isAttestationCompletable(Attestation storage attestation) internal view returns (bool) {
    return (attestation.status == AttestationStatus.Incomplete &&
      !isAttestationExpired(attestation.blockNumber));
  }

  function isAttestationRequestSelectable(uint256 attestationRequestBlock)
    internal
    view
    returns (bool)
  {
    return block.number < attestationRequestBlock.add(getRandom().randomnessBlockRetentionWindow());
  }
}
