pragma solidity 0.4.24;

import "./SplitterConverter.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "@optionality.io/clone-factory/contracts/CloneFactory.sol";


contract SplitterConverterFactory is Ownable, CloneFactory {

    address public libraryAddress;

    event SplitterConverterCreated(address newCloneAddress);

    constructor(address _libraryAddress) public {
        libraryAddress = _libraryAddress;
    }

    function setLibraryAddress(address _libraryAddress) external onlyOwner {
        require(libraryAddress != _libraryAddress);
        require(_libraryAddress != address(0x0));

        libraryAddress = _libraryAddress;
    }

    function createSplitterConverter(
        address[] addresses,
        uint8[] shares,
        ERC20[] outCurrencies
    )
        external
        returns(address)
    {
        address clone = createClone(libraryAddress);
        SplitterConverter(clone).setUp(addresses, shares, outCurrencies);
        emit SplitterConverterCreated(clone);
        return clone;
    }
}