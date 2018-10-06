pragma solidity 0.4.25;


/**
 * @title Payments Splitting contract.
 *
 * @dev Contract for companies or groups of people who wants to accept Ethereum donations or payments and
 * distribution funds by preconfigured rules.
 */
contract DeconetPaymentsSplitting {

    // Logged on this distribution set up completion.
    event DistributionCreated (
        address[] destinations,
        uint[] sharesMantissa,
        uint sharesExponent
    );

    // Logged when funds landed to or been sent out from this contract balance.
    event FundsOperation (
        address indexed senderOrAddressee,
        uint amount,
        FundsOperationType indexed operationType
    );

    // Enumeration of possible funds operations.
    enum FundsOperationType { Incoming, Outgoing }

    // Describes Distribution destination and its share of all incoming funds.
    struct Distribution {
        // Destination address of the distribution.
        address destination;

        // Floating-point number mantissa of a share allotted for a destination address.
        uint mantissa;
    }

    // Stores exponent of a power term of a floating-point number.
    uint public sharesExponent;

    // Stores list of distributions.
    Distribution[] public distributions;

    /**
     * @dev Payable fallback that tries to send over incoming funds to the distribution destinations splitted
     * by pre-configured shares. In case when there is not enough gas sent for the transaction to complete
     * distribution, all funds will be kept in contract untill somebody calls `withdrawFullContractBalance` to
     * run postponed distribution and withdraw contract's balance funds.
     */
    function () public payable {
        emit FundsOperation(msg.sender, msg.value, FundsOperationType.Incoming);
        // Distribution happens in a for loop and every iteration requires fixed 10990 of gas to perform
        // distribution. Also, 1512 of gas is required to call `withdrawFullContractBalance` method and do
        // some checks and preps in it.
        if (gasleft() < (10990 * distributions.length + 1512)) return;
        withdrawFullContractBalance();
    }

    /**
     * @dev Set up distribution for the current clone, can be called only once.
     * @param _destinations Destination addresses of the current payments splitting contract clone.
     * @param _sharesMantissa Mantissa values for destinations shares ordered respectively with `_destinations`.
     * @param _sharesExponent Exponent of a power term that forms shares floating-point numbers, expected to
     * be the same for all values in `_sharesMantissa`.
     */
    function setUpDistribution(
        address[] _destinations,
        uint[] _sharesMantissa,
        uint _sharesExponent
    )
        external
    {
        require(distributions.length == 0); // Make sure the clone isn't initialized yet.
        require(_destinations.length <= 5 && _destinations.length > 0);
        uint sum = 0;
        for (uint i = 0; i < _destinations.length; i++) {
            sum += _sharesMantissa[i];
            distributions.push(Distribution(_destinations[i], _sharesMantissa[i]));
        }
        require(sum == 10**(_sharesExponent + 2)); // taking into account 100% by adding 2 to the exponenta.
        sharesExponent = _sharesExponent;
        emit DistributionCreated(_destinations, _sharesMantissa, _sharesExponent);
    }

    /**
     * @dev Process the available balance through the distribution and send money over to destination address.
     */
    function withdrawFullContractBalance() public {
        uint distributionsCount = distributions.length;
        if (gasleft() < 10990 * distributionsCount) return;
        uint balance = address(this).balance;
        uint exponent = sharesExponent;
        require(balance >= 10**(exponent + 2));
        for (uint i = 0; i < distributionsCount; i++) {
            Distribution memory distribution = distributions[i];
            uint amount = calculatePayout(balance, distribution.mantissa, exponent);
            if(distribution.destination.send(amount)) {
                emit FundsOperation(distribution.destination, amount, FundsOperationType.Outgoing);
            }
        }
    }


    /**
     * @dev Calculates a share of the full amount.
     * @param _fullAmount Full amount.
     * @param _shareMantissa Mantissa of the percentage floating-point number.
     * @param _shareExponent Exponent of the percentage floating-point number.
     * @return An uint of the payout.
     */
    function calculatePayout(uint _fullAmount, uint _shareMantissa, uint _shareExponent) public pure returns(uint) {
        return (_fullAmount / (10 ** (_shareExponent + 2))) * _shareMantissa;
    }
}
