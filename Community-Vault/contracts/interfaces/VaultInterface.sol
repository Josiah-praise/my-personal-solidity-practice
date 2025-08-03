// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IVAULT {
    struct Donor {
        address donor;
        uint256 amount;
        uint256 timeOfFirstDonation;
        bool exists;
        State state;
    }

    enum State{
        FUNDED, EMPTY
    }

    function donate()external payable;

    function withdraw()external;
}