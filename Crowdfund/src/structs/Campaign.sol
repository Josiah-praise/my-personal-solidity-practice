// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Fulfillment} from "../enums/Fulfillment.sol";


///@notice represents a campaign in the contract
struct Campaign{
    uint256 minimumDonationInWei;
    uint256 goalInWei;
    uint256 purse;
    uint256 epochDate;
    string details;
    address owner;
    Fulfillment fulfillment;
    mapping(address  =>uint256) senderDonations;
}
