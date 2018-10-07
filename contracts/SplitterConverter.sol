pragma solidity 0.4.24;


interface ERC20 {
    function totalSupply() public view returns (uint supply);
    function balanceOf(address _owner) public view returns (uint balance);
    function transfer(address _to, uint _value) public returns (bool success);
    function transferFrom(address _from, address _to, uint _value) public returns (bool success);
    function approve(address _spender, uint _value) public returns (bool success);
    function allowance(address _owner, address _spender) public view returns (uint remaining);
    function decimals() public view returns(uint digits);
    event Approval(address indexed _owner, address indexed _spender, uint _value);
}

/// @title Kyber Network interface
interface KyberNetworkProxyInterface {
    function maxGasPrice() public view returns(uint);
    function getUserCapInWei(address user) public view returns(uint);
    function getUserCapInTokenWei(address user, ERC20 token) public view returns(uint);
    function enabled() public view returns(bool);
    function info(bytes32 id) public view returns(uint);

    function getExpectedRate(ERC20 src, ERC20 dest, uint srcQty) public view
        returns (uint expectedRate, uint slippageRate);

    function tradeWithHint(ERC20 src, uint srcAmount, ERC20 dest, address destAddress, uint maxDestAmount,
        uint minConversionRate, address walletId, bytes hint) public payable returns(uint);
}

/// @title simple interface for Kyber Network
interface SimpleNetworkInterface {
    function swapTokenToToken(ERC20 src, uint srcAmount, ERC20 dest, uint minConversionRate) public returns(uint);
    function swapEtherToToken(ERC20 token, uint minConversionRate) public payable returns(uint);
    function swapTokenToEther(ERC20 token, uint srcAmount, uint minConversionRate) public returns(uint);
}

/**
 * @title SafeMath
 * @dev Math operations with safety checks that revert on error
 */
library SafeMath {

  /**
  * @dev Multiplies two numbers, reverts on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
    if (a == 0) {
      return 0;
    }

    uint256 c = a * b;
    require(c / a == b);

    return c;
  }

  /**
  * @dev Integer division of two numbers truncating the quotient, reverts on division by zero.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b > 0); // Solidity only automatically asserts when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold

    return c;
  }

  /**
  * @dev Subtracts two numbers, reverts on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b <= a);
    uint256 c = a - b;

    return c;
  }

  /**
  * @dev Adds two numbers, reverts on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    require(c >= a);

    return c;
  }

  /**
  * @dev Divides two numbers and returns the remainder (unsigned integer modulo),
  * reverts when dividing by zero.
  */
  function mod(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b != 0);
    return a % b;
  }
}


// Splits incoming ETH payments, and pays out in whatever token or ETH the receiver wants
contract SplitterConverter {
    using SafeMath for uint;

    // copied from kyber contract
    ERC20 constant internal ETH_TOKEN_ADDRESS = ERC20(0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee);

    event FundsReceived(uint256 amount);
    event FundsSent(uint receiverIndex, address receiverAddress, uint256 amount);

    event OrcalizeQueried(bytes32 id, string url);
    event OrcalizeResult(bytes32 id, string result);

    struct Receiver {
        address outAddress;
        uint8 share;
        ERC20 outCurrency;
    }

    Receiver[] receivers;

    KyberNetworkProxyInterface kyberNetworkProxy =  KyberNetworkProxyInterface(0x818E6FECD516Ecc3849DAf6845e3EC868087B755);

    ERC20 daiToken = ERC20(0xaD6D458402F60fD3Bd25163575031ACDce07538D);

    function () payable public {
        emit FundsReceived(msg.value);
    }

    function setUp(address[] addresses, uint8[] shares, ERC20[] outCurrencies) public {
        require(receivers.length == 0, "Contract can only be set up once");
        require(addresses.length == shares.length && shares.length == outCurrencies.length, "Bad input params");
        uint shareSum = 0;
        for(uint i = 0; i < addresses.length; i++){
            receivers.push(Receiver(addresses[i], shares[i], outCurrencies[i]));
            shareSum = shareSum.add(shares[i]);
        }
        require(shareSum == 100, "The sum of user shares should be 100");
    }

    function withdraw() public {
        uint ethBalance = address(this).balance;
        uint daiBalance = daiToken.balanceOf(address(this));
        for(uint i = 0; i < receivers.length; i++){
            Receiver memory receiver = receivers[i];
            uint ethReceiverShare = ethBalance / 100 * receiver.share;
            uint daiReceiverShare = daiBalance / 100 * receiver.share;
            emit FundsSent(i, receiver.outAddress, ethReceiverShare);
            if (receiver.outCurrency == ETH_TOKEN_ADDRESS){
                // user wants ETH
                if (ethReceiverShare != 0) {
                    receiver.outAddress.transfer(ethReceiverShare);
                }
                if (daiReceiverShare != 0){
                    // convert dai to eth
                    swapTokenToEther(daiToken, daiReceiverShare, receiver.outAddress);
                }
            } else if (receiver.outCurrency == daiToken){
                // user wants dai
                if (ethReceiverShare != 0) {
                    // convert eth to dai
                    swapEtherToToken(ethReceiverShare, receiver.outCurrency, receiver.outAddress);
                }
                if (daiReceiverShare != 0){
                    // send dai directly
                    daiToken.transfer(receiver.outAddress, daiReceiverShare);
                }

            } else {
                // user wants something besides eth or dai
                if (ethReceiverShare != 0) {
                    // convert eth to whatever token they want
                    swapEtherToToken(ethReceiverShare, receiver.outCurrency, receiver.outAddress);
                }
                if (daiReceiverShare != 0) {
                    // convert dai to whatever token they want
                    swapTokenToToken(daiToken, daiReceiverShare, receiver.outCurrency, receiver.outAddress);
                }
            }
        }
    }

    //@dev assumed to be receiving ether wei
    //@param token destination token contract address
    //@param destAddress address to send swapped tokens to
    function swapEtherToToken (uint256 amount, ERC20 token, address destAddress) internal {
        uint minRate;
        (, minRate) = kyberNetworkProxy.getExpectedRate(ETH_TOKEN_ADDRESS, token, amount);

        //will send back tokens to this contract's address
        uint destAmount = SimpleNetworkInterface(kyberNetworkProxy).swapEtherToToken.value(amount)(token, minRate);

        //send received tokens to destination address
        require(token.transfer(destAddress, destAmount));
    }

    function swapTokenToToken (ERC20 srcToken, uint srcQty, ERC20 destToken, address destAddress) internal {
        uint minRate;

        //getExpectedRate returns expected rate and slippage rate
        //we use the slippage rate as the minRate
        (, minRate) = kyberNetworkProxy.getExpectedRate(srcToken, destToken, srcQty);

        // Mitigate ERC20 Approve front-running attack, by initially setting
        // allowance to 0
        require(srcToken.approve(kyberNetworkProxy, 0));

        //approve tokens so network can take them during the swap
        srcToken.approve(address(kyberNetworkProxy), srcQty);
        uint destAmount = SimpleNetworkInterface(kyberNetworkProxy).swapTokenToToken(srcToken, srcQty, destToken, minRate);

        //send received tokens to destination address
        require(destToken.transfer(destAddress, destAmount));
    }

    function swapTokenToEther (ERC20 srcToken, uint tokenQty, address destAddress) internal {

        uint minRate;
        (, minRate) = kyberNetworkProxy.getExpectedRate(srcToken, ETH_TOKEN_ADDRESS, tokenQty);

        // Mitigate ERC20 Approve front-running attack, by initially setting
        // allowance to 0
        require(srcToken.approve(kyberNetworkProxy, 0));

        //approve tokens so network can take them during the swap
        srcToken.approve(address(kyberNetworkProxy), tokenQty);
        uint destAmount = SimpleNetworkInterface(kyberNetworkProxy).swapTokenToEther(srcToken, tokenQty, minRate);

        //send received ethers to destination address
        destAddress.transfer(destAmount);
    }
}
