// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Campaign} from "../structs/campaign.sol";
import {State} from "../enums/state.sol";

library CrowdFundLibrary{

    function isFundable(Campaign storage campaign)external view returns(bool){
        if (campaign.exists &&
            block.timestamp < (campaign.createdAt + (campaign.durationInDays * 1 days))
        ) 
            return true;
        return false;
    }

    function isWithdrawable(Campaign storage campaign)external view returns(bool){
        if (
            campaign.exists &&
            block.timestamp > (campaign.createdAt + (campaign.durationInDays * 1 days)) &&
            campaign.state == State.MET
        )
            return true;
        return false;
    }
}