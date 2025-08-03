//SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IVAULT} from "./interfaces/VaultInterface.sol";

contract Vault is IVAULT{
    mapping(address=>IVAULT.Donor)public donors;

    uint256 public constant LOCK_TIME = 30 days;

    error UnAuthorized();
    error InsufficientFunds();
    error FundsLocked();
    error WithdrawalError();


    function withdraw()external {
        if (!donors[msg.sender].exists)
            revert UnAuthorized();
        if (donors[msg.sender].timeOfFirstDonation + LOCK_TIME > block.timestamp)
            revert FundsLocked();
        if (donors[msg.sender].amount == 0)
            revert InsufficientFunds();
        uint256 amount = donors[msg.sender].amount;
        donors[msg.sender].amount = 0;
        donors[msg.sender].state = IVAULT.State.EMPTY;

        (bool success,) = msg.sender.call{value: amount }("");

        if (!success)
            revert WithdrawalError();

    }

    function donate()external payable {
        if (donors[msg.sender].exists) {
            if (donors[msg.sender].state == IVAULT.State.EMPTY)
                donors[msg.sender].timeOfFirstDonation = block.timestamp;
            donors[msg.sender].amount += msg.value;
        } else {
            IVAULT.Donor memory newDonor = IVAULT.Donor(
                msg.sender, 
                msg.value, 
                block.timestamp, 
                true, 
                IVAULT.State.FUNDED
            );
            donors[msg.sender] = newDonor;
        }
        
    }
}