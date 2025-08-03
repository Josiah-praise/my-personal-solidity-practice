// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {State} from "../enums/state.sol";
import {Donor} from "../structs/donor.sol";

struct Campaign{
        address owner;
        uint256 fundingGoal;
        uint256 durationInDays;
        uint256 createdAt;
        bool exists;
        uint256 purse;
        mapping(address=>Donor) addressToDonors;
        Donor[] donors;
        State state;
    }