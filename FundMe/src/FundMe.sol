// SPX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {PriceConverter} from "./PriceConverterLibrary.sol";

///@notice A funding program
contract FundMe is Ownable {

    using PriceConverter for uint256;

    AggregatorV3Interface private immutable i_priceFeed;

    uint256 public minimumUSD;
    address[] private funders;

    mapping(address=> uint256)public amountFunded; 


    error MinimumUSDError(uint256 amount);
    error TransferUnsuccessfulError(uint256 amount);
    error InsufficientETHError();

    event AmountFunded(address indexed _funder, uint256 amount);
    event Withdrawal(uint256 amount);
    event MinimumUSD(uint256 usd);

    ///@param _priceFeedAddress the address of chainlink's pricefeed contract
    ///@param ownerAddress the address of the contract owner
    constructor(address _priceFeedAddress, address ownerAddress, uint256 _minimumUSD) Ownable(ownerAddress) {
        i_priceFeed = AggregatorV3Interface(_priceFeedAddress);
        minimumUSD = _minimumUSD;
    }

    ///@notice allows contract owner to set minimum fund amount
    ///@param _amount minimum amount 
    function setMinimumUSD(uint256 _amount)external onlyOwner{
        minimumUSD = _amount;

        emit MinimumUSD(_amount);
    }

    ///@notice allows users to send eth into the contract
    ///people cannot send beneath 5usd
    function fund()external payable sentMinimumFunds{
        funders.push(msg.sender);
        amountFunded[msg.sender] += msg.value;

        emit AmountFunded(msg.sender, msg.value);
    }

    ///@notice withdraw from contract
    function withdraw()public onlyOwner IsNotEmpty returns(bool){
        (bool successful,) = owner().call{value: address(this).balance}("");
        if (!successful) {
            revert TransferUnsuccessfulError(address(this).balance);
        }
        emit Withdrawal(address(this).balance);
        return successful;
    }


    ///@notice ensures a user sends at least the minimum amount of eth
    modifier sentMinimumFunds() {
         uint256 usdDecimals = i_priceFeed.decimals();
        (,int256 oneETHToUSD,,,) = i_priceFeed.latestRoundData(); // value of one eth in USD in the right decimals
        uint256 minimumUSDInWei = minimumUSD.convertFromUSDToWei(usdDecimals, uint256(oneETHToUSD));

        if (msg.value < minimumUSDInWei) {
            revert MinimumUSDError(msg.value);
        }
        _;
    }

    ///@notice ensures the contract's balance is not empty
    modifier IsNotEmpty {
        if (address(this).balance <=0) {
            revert InsufficientETHError();
        }
        _;
    }

}