// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Campaign} from './structs/Campaign.sol';
import {PriceConverter} from "./library/PriceConverter.lib.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {Fulfillment} from "./enums/Fulfillment.sol";


contract CrowdFund{
    using PriceConverter for uint256;

    AggregatorV3Interface internal priceFeed;
    uint8 internal immutable i_usdDecimals;
    Campaign[] public campaigns;

    ///@notice logs info when a campaign is created
    event CreateCampaign(address indexed owner, uint256 minimumDonationInUSD, uint256 
    goalInWei, string details, uint256 epochDate);

    ///@notice logs when a user funds a campaign
    event Fund(address sender, uint256 amount);

    ///@notice logs a withdrawal
    event Withdrawal(address indexed owner, uint256 amount);

    ///@notice logs a refund
    event Refund(address indexed donor, uint256 amount);

    error IncorrectDurationError();
    error ZeroGoalError();
    error CampaignNotFoundError();
    error BelowMinimumUSDError();
    error CampaignClosedError();
    error CampaignNotClosedError();
    error GoalNotMetError();
    error UnAuthorizedError();
    error WithdrawalError();
    error NoDonationError();
    error RefundError();
    error GoalMetError();

    modifier goalNotMet(uint256 _index) {
        if (campaigns[_index].purse >= campaigns[_index].goalInWei) {
            revert GoalMetError();
        }
        _;
    }

    modifier isOpen(uint256 _index) {
        if (campaigns[_index].epochDate < block.timestamp ) {
            revert CampaignClosedError();
        }
        _;
    }

    modifier hitGoal(uint256 _index) {
        if (campaigns[_index].purse < campaigns[_index].goalInWei) {
            revert GoalNotMetError();
        }
        _;
    }

    modifier meetsMinimumUSDRequirement(uint256 _index) {
        if (msg.value < campaigns[_index].minimumDonationInWei) {
            revert BelowMinimumUSDError();
        }
        _;
    }

    modifier isFutureDate(uint256 _epochDate) {
        if (block.timestamp > _epochDate) {
            revert IncorrectDurationError();
        }
        _;
    }

    modifier notZeroGoal(uint256 _goal) {
        if (_goal == 0) {
            revert ZeroGoalError();
        }
        _;
    }

    modifier isClosed(uint256 _index) {
        if (campaigns[_index].epochDate > block.timestamp) {
            revert CampaignNotClosedError();
        }
        _;
    }

    modifier campaignExists(uint256 _index) {
        if (campaigns.length == 0 || _index > campaigns.length - 1) {
            revert CampaignNotFoundError();
        }
        _;
    }

    modifier owns(uint256 _index) {
        if (msg.sender != campaigns[_index].owner) {
            revert UnAuthorizedError();
        }
        _;
    }

    constructor(address _priceFeedAddress) {
       priceFeed = AggregatorV3Interface(_priceFeedAddress);
       i_usdDecimals = priceFeed.decimals();
    }

    function createCampaign(
        uint256 _minimumDonationInUSD,
        uint256 _goal,
        string calldata _details,
        uint256 _epochDate
    )
    external 
    isFutureDate(_epochDate)
    notZeroGoal(_goal)
    returns (uint256)
    {

        // convert _goal and _minumDonationInUSD to wei
        (,int256 oneETHToUSDUnits,,,) = priceFeed.latestRoundData();
        uint256 goalInWei = _goal.convertFromUSDToWei(uint256(i_usdDecimals), uint256(oneETHToUSDUnits));
        uint256 minimumUSDInWei = _minimumDonationInUSD.convertFromUSDToWei(uint256(i_usdDecimals), uint256(oneETHToUSDUnits));

        Campaign storage newCampaign = campaigns.push();

        newCampaign.minimumDonationInWei = minimumUSDInWei;
        newCampaign.goalInWei = goalInWei;
        newCampaign.details = _details;
        newCampaign.epochDate = _epochDate;
        newCampaign.owner = msg.sender;
        newCampaign.fulfillment = Fulfillment.unfulfilled;


        emit CreateCampaign(msg.sender, _minimumDonationInUSD, _goal, _details, _epochDate);

        return campaigns.length - 1;
    }

    function fund(uint256 _index)
    external campaignExists(_index) isOpen(_index)
    meetsMinimumUSDRequirement(_index)
    payable{
        Campaign storage oldCampaign = campaigns[_index];
        oldCampaign.senderDonations[msg.sender] += msg.value;
        oldCampaign.purse += msg.value;

        emit Fund(msg.sender, msg.value);

        if (oldCampaign.purse >= oldCampaign.goalInWei) {
            oldCampaign.fulfillment = Fulfillment.fulfilled;
        }
    }

    function getMyDonation(uint256 _index)external campaignExists(_index) view returns(uint256){
        return campaigns[_index].senderDonations[msg.sender];
    }

    function withdraw(uint256 _index)
    external 
    campaignExists(_index) 
    owns(_index) 
    isClosed(_index) 
    hitGoal(_index) 
    returns(bool){
        uint256 balance = campaigns[_index].purse;
        campaigns[_index].purse = 0;
        (bool success,) = msg.sender.call{value: balance}("");

        if (!success) {
            revert WithdrawalError();
        }

        emit Withdrawal(msg.sender, balance);
        return true;
    }

    function refund(uint256 _index)
    external
    campaignExists(_index)
    isClosed(_index)
    goalNotMet(_index)
    returns(bool)
    {
        uint256 donation = campaigns[_index].senderDonations[msg.sender];
        if (donation == 0) {
            revert NoDonationError();
        }
        campaigns[_index].senderDonations[msg.sender] = 0;
        campaigns[_index].purse -= donation;

        (bool success,) = msg.sender.call{value: donation}("");

        if (!success) {
            revert RefundError();
        }

        emit Refund(msg.sender, donation);

        return success;
    }
}
