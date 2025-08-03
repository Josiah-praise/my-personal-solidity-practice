// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import {CrowdFundLibrary} from "./library/CrowdFundLibrary.sol";
import {Campaign} from "./structs/campaign.sol";
import {State} from "./enums/state.sol";
import {Donor} from "./structs/donor.sol";


contract CrowdFund{
    Campaign[] public s_campaign_array;
    mapping(bytes4 => Campaign) public s_campaign_map;

    error CampaignClosedError();
    error CampaignNotFoundError();
    error GoalNotMetError();
    error UnAuthorized();
    error CampaignNotClosedError();
    error WithdrawalError();
    error GoalMetError();
    error RefundError();

    event Withdrawal(address indexed owner, uint256 amount, bytes4 indexed campaignID);
    event Refund(address indexed donor, uint256 amount);
    event Donation(address indexed donor, bytes4 indexed campaignID, uint256 amount);
    event CampaignCreated(address indexed owner, bytes4 indexed campaignID);

    modifier onlyOwner(bytes4 campaignID) {
        if (
            s_campaign_map[campaignID].owner != msg.sender 
        )
            revert UnAuthorized();
        _;
    }

    modifier onlyDonor(bytes4 campaignID) {
        if (
            s_campaign_map[campaignID].addressToDonors[msg.sender].amount == 0
        )
            revert UnAuthorized();
        _;
    }

    function createCampaign(
    uint256 _fundingGoal,
    uint256 _durationInDays
) external {
    bytes4 campaign_id = bytes4(keccak256(abi.encodePacked(msg.sender, block.timestamp)));

    // push a new empty Campaign into the array
    Campaign storage newCampaign = s_campaign_array.push();

    //  populate fields
    newCampaign.owner = msg.sender;
    newCampaign.fundingGoal = _fundingGoal;
    newCampaign.durationInDays = _durationInDays;
    newCampaign.createdAt = block.timestamp;
    newCampaign.exists = true;
    newCampaign.state = State.NOT_MET;

    // create a second storage reference to the mapping and copy fields manually
    Campaign storage mappedCampaign = s_campaign_map[campaign_id];
    mappedCampaign.owner = newCampaign.owner;
    mappedCampaign.fundingGoal = newCampaign.fundingGoal;
    mappedCampaign.durationInDays = newCampaign.durationInDays;
    mappedCampaign.createdAt = newCampaign.createdAt;
    mappedCampaign.exists = true;
    mappedCampaign.state = State.NOT_MET;


    emit CampaignCreated(msg.sender, campaign_id);
}

    function donate(bytes4 _campaignID)external payable{
        campaignExists(_campaignID);

        Campaign storage campaign = s_campaign_map[_campaignID]; // get a pointer to the campaign

        if (!CrowdFundLibrary.isFundable(campaign))
            revert CampaignClosedError();

        

        if (campaign.addressToDonors[msg.sender].exists) {
            campaign.addressToDonors[msg.sender].amount += msg.value;
        } else {
            Donor memory donor = Donor(campaign.donors.length, msg.value, true); // create donor
            campaign.donors.push(donor);
            campaign.addressToDonors[msg.sender] = donor;
        }

        

        campaign.purse += msg.value; // update the campaign's purse

        if (campaign.purse >= campaign.fundingGoal) { // check if goal was met
            campaign.state = State.MET; // update campaign's state
        }
        emit Donation(msg.sender, _campaignID, msg.value);
    }

    function withdrawFromCampaign(bytes4 campaignID)external onlyOwner(campaignID){
        campaignExists(campaignID);

        Campaign storage campaign = s_campaign_map[campaignID]; // get campaign from map
        
        if (block.timestamp < campaign.createdAt + (campaign.durationInDays * 1 days)) // campaign must have closed
            revert CampaignNotClosedError();
        
        if (campaign.state != State.MET) // goals must be met to withdraw
            revert GoalNotMetError();
        
        uint256 amount = campaign.purse;
        campaign.purse = 0;

        (bool success, ) = msg.sender.call{value: amount}(""); // send eth to campaign owner

        emit Withdrawal(msg.sender, amount, campaignID);

        if (!success)
            revert WithdrawalError();

    }

    function getRefund(bytes4 campaignID)external onlyDonor(campaignID){
        campaignExists(campaignID);

        Campaign storage campaign = s_campaign_map[campaignID];

        if (campaign.state == State.MET)
            revert GoalMetError();
        
        if (block.timestamp < campaign.createdAt + (campaign.durationInDays * 1 days)) // campaign must have closed
            revert CampaignNotClosedError();
        
        uint256 donorIndex = campaign.addressToDonors[msg.sender].index;
        Donor storage lastDonor = campaign.donors[campaign.donors.length - 1];

        uint256 amount = campaign.addressToDonors[msg.sender].amount;

        // perform swap 
        campaign.donors[donorIndex] = lastDonor;
        // update last elements index
        lastDonor.index = donorIndex;
        campaign.donors.pop(); // delete last donor
        Donor memory newDonor;
        campaign.addressToDonors[msg.sender] = newDonor;
        

        (bool success, ) = msg.sender.call{value: amount}(""); // refund donor

        if (!success)
            revert RefundError();

    }

    function getCampaignDetails(bytes4 campaignID)
    external view returns (
        address owner,
        uint256 fundingGoal,
        uint256 durationInDays,
        uint256 createdAt,
        State state
    ) {
        campaignExists(campaignID);

        Campaign storage campaign = s_campaign_map[campaignID];

        return (
            campaign.owner,
            campaign.fundingGoal,
            campaign.durationInDays,
            campaign.createdAt,
            campaign.state
        );
    }

    function getCampaignDonors(bytes4 campaignID)external view returns(Donor[] memory){
        campaignExists(campaignID);

        return s_campaign_map[campaignID].donors;
    }

    function campaignExists(bytes4 campaignID)internal view{
        if (!s_campaign_map[campaignID].exists)
            revert CampaignNotFoundError();
    }

}
