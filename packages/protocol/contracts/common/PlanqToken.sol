pragma solidity ^0.5.13;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

import "./UsingRegistry.sol";
import "./Initializable.sol";
import "./interfaces/IPlanqToken.sol";
import "../common/interfaces/IPlanqVersionedContract.sol";

contract PlanqToken is
    Initializable,
    UsingRegistry,
    IERC20,
    IPlanqToken,
    IPlanqVersionedContract
{
    using SafeMath for uint256;

    // Address of the TRANSFER precompiled contract.
    // solhint-disable state-visibility
    address constant TRANSFER = address(0xff - 2);
    string constant NAME = "Planq native asset";
    string constant SYMBOL = "PLQ";
    uint8 constant DECIMALS = 18;
    uint256 internal totalSupply_;
    // solhint-enable state-visibility

    mapping(address => mapping(address => uint256)) internal allowed;

    // Burn address is 0xdEaD because truffle is having buggy behaviour with the zero address
    address constant BURN_ADDRESS = address(
        0x000000000000000000000000000000000000dEaD
    );

    event Transfer(address indexed from, address indexed to, uint256 value);

    event TransferComment(string comment);

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    /**
   * @notice Sets initialized == true on implementation contracts
   * @param test Set to true to skip implementation initialization
   */
    constructor(bool test) public Initializable(test) {}

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
        return (1, 1, 2, 0);
    }

    /**
   * @notice Used in place of the constructor to allow the contract to be upgradable via proxy.
   * @param registryAddress Address of the Registry contract.
   */
    function initialize(address registryAddress) external initializer {
        totalSupply_ = 0;
        _transferOwnership(msg.sender);
        setRegistry(registryAddress);
    }

    /**
   * @notice Transfers PLQ from one address to another.
   * @param to The address to transfer PLQ to.
   * @param value The amount of PLQ to transfer.
   * @return True if the transaction succeeds.
   */
    // solhint-disable-next-line no-simple-event-func-name
    function transfer(address to, uint256 value) external returns (bool) {
        return _transferWithCheck(to, value);
    }

    /**
   * @notice Transfers PLQ from one address to another with a comment.
   * @param to The address to transfer PLQ to.
   * @param value The amount of PLQ to transfer.
   * @param comment The transfer comment
   * @return True if the transaction succeeds.
   */
    function transferWithComment(
        address to,
        uint256 value,
        string calldata comment
    ) external returns (bool) {
        bool succeeded = _transferWithCheck(to, value);
        emit TransferComment(comment);
        return succeeded;
    }

    /**
   * @notice This function allows a user to burn a specific amount of tokens.
     Burning is implemented by sending tokens to the burn address.
   * @param value: The amount of PLQ to burn.
   * @return True if burn was successful.
   */
    function burn(uint256 value) external returns (bool) {
        // not using transferWithCheck as the burn address can potentially be the zero address
        return _transfer(BURN_ADDRESS, value);
    }

    /**
   * @notice Approve a user to transfer PLQ on behalf of another user.
   * @param spender The address which is being approved to spend PLQ.
   * @param value The amount of PLQ approved to the spender.
   * @return True if the transaction succeeds.
   */
    function approve(address spender, uint256 value) external returns (bool) {
        require(spender != address(0), "cannot set allowance for 0");
        allowed[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    /**
   * @notice Increases the allowance of another user.
   * @param spender The address which is being approved to spend PLQ.
   * @param value The increment of the amount of PLQ approved to the spender.
   * @return True if the transaction succeeds.
   */
    function increaseAllowance(address spender, uint256 value)
        external
        returns (bool)
    {
        require(spender != address(0), "cannot set allowance for 0");
        uint256 oldValue = allowed[msg.sender][spender];
        uint256 newValue = oldValue.add(value);
        allowed[msg.sender][spender] = newValue;
        emit Approval(msg.sender, spender, newValue);
        return true;
    }

    /**
   * @notice Decreases the allowance of another user.
   * @param spender The address which is being approved to spend PLQ.
   * @param value The decrement of the amount of PLQ approved to the spender.
   * @return True if the transaction succeeds.
   */
    function decreaseAllowance(address spender, uint256 value)
        external
        returns (bool)
    {
        uint256 oldValue = allowed[msg.sender][spender];
        uint256 newValue = oldValue.sub(value);
        allowed[msg.sender][spender] = newValue;
        emit Approval(msg.sender, spender, newValue);
        return true;
    }

    /**
   * @notice Transfers PLQ from one address to another on behalf of a user.
   * @param from The address to transfer PLQ from.
   * @param to The address to transfer PLQ to.
   * @param value The amount of PLQ to transfer.
   * @return True if the transaction succeeds.
   */
    function transferFrom(address from, address to, uint256 value)
        external
        returns (bool)
    {
        require(to != address(0), "transfer attempted to reserved address 0x0");
        require(
            value <= balanceOf(from),
            "transfer value exceeded balance of sender"
        );
        require(
            value <= allowed[from][msg.sender],
            "transfer value exceeded sender's allowance for spender"
        );

        bool success;
        (success, ) = TRANSFER.call.value(0).gas(gasleft())(
            abi.encode(from, to, value)
        );
        require(success, "PLQ transfer failed");

        allowed[from][msg.sender] = allowed[from][msg.sender].sub(value);
        emit Transfer(from, to, value);
        return true;
    }

    /**
   * @notice Mints new PLQ and gives it to 'to'.
   * @param to The account for which to mint tokens.
   * @param value The amount of PLQ to mint.
   */
    function mint(address to, uint256 value) external onlyOwner returns (bool) {
        if (value == 0) {
            return true;
        }

        require(to != address(0), "mint attempted to reserved address 0x0");
        totalSupply_ = totalSupply_.add(value);

        bool success;
        (success, ) = TRANSFER.call.value(0).gas(gasleft())(
            abi.encode(address(0), to, value)
        );
        require(success, "PLQ transfer failed");

        emit Transfer(address(0), to, value);
        return true;
    }

    /**
   * @return The name of the PLQ token.
   */
    function name() external view returns (string memory) {
        return NAME;
    }

    /**
   * @return The symbol of the PLQ token.
   */
    function symbol() external view returns (string memory) {
        return SYMBOL;
    }

    /**
   * @return The number of decimal places to which PLQ is divisible.
   */
    function decimals() external view returns (uint8) {
        return DECIMALS;
    }

    /**
   * @return The total amount of PLQ in existence, including what the burn address holds.
   */
    function totalSupply() external view returns (uint256) {
        return totalSupply_;
    }

    /**
   * @return The total amount of PLQ in existence, not including what the burn address holds.
   */
    function circulatingSupply() external view returns (uint256) {
        return totalSupply_.sub(getBurnedAmount()).sub(balanceOf(address(0)));
    }

    /**
   * @notice Gets the amount of owner's PLQ allowed to be spent by spender.
   * @param owner The owner of the PLQ.
   * @param spender The spender of the PLQ.
   * @return The amount of PLQ owner is allowing spender to spend.
   */
    function allowance(address owner, address spender)
        external
        view
        returns (uint256)
    {
        return allowed[owner][spender];
    }

    /**
   * @notice Increases the variable for total amount of PLQ in existence.
   * @param amount The amount to increase counter by
   */
    function increaseSupply(uint256 amount) external onlyOwner {
        totalSupply_ = totalSupply_.add(amount);
    }

    /**
   * @notice Gets the amount of PLQ that has been burned.
   * @return The total amount of Planq that has been sent to the burn address.
   */
    function getBurnedAmount() public view returns (uint256) {
        return balanceOf(BURN_ADDRESS);
    }

    /**
   * @notice Gets the balance of the specified address.
   * @param owner The address to query the balance of.
   * @return The balance of the specified address.
   */
    function balanceOf(address owner) public view returns (uint256) {
        return owner.balance;
    }

    /**
   * @notice internal PLQ transfer from one address to another.
   * @param to The address to transfer PLQ to.
   * @param value The amount of PLQ to transfer.
   * @return True if the transaction succeeds.
   */
    function _transfer(address to, uint256 value) internal returns (bool) {
        require(
            value <= balanceOf(msg.sender),
            "transfer value exceeded balance of sender"
        );

        bool success;
        (success, ) = TRANSFER.call.value(0).gas(gasleft())(
            abi.encode(msg.sender, to, value)
        );
        require(success, "PLQ transfer failed");
        emit Transfer(msg.sender, to, value);
        return true;
    }

    /**
   * @notice Internal PLQ transfer from one address to another.
   * @param to The address to transfer PLQ to. Zero address will revert.
   * @param value The amount of PLQ to transfer.
   * @return True if the transaction succeeds.
   */
    function _transferWithCheck(address to, uint256 value)
        internal
        returns (bool)
    {
        require(to != address(0), "transfer attempted to reserved address 0x0");
        return _transfer(to, value);
    }
}
