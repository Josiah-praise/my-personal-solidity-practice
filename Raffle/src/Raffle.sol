// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import  {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

// Pragma statements

// Import statements

// Events

// Errors

// Interfaces

// Libraries

// Contracts

// Inside each contract, library or interface, use the following order:

// Type declarations

// State variables

// Events

// Errors

// Modifiers

// Functions


/**
 * @notice a raffle contract where users can enter a raffle. To enter the raffle, you have to pay the entry fee in eth
 * that eth goes into the contract's pool. The winner is picked randomly. Payout to the winner is done automatically
 * The idea is that this is an automatic raffle controlled by code only. Generous people can fund the raffle and still participate in it
 * After every raffle, there's a wait time until the users can enter the raffle again
 */
contract Raffle is VRFConsumerBaseV2Plus, AutomationCompatibleInterface{
    // VRF settings
    address constant VRF_COORDINATOR_ADDRESS = 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B; // address of the vrf_coordinator contract
    bytes32 constant KEY_HASH = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;
    uint16 constant REQUEST_CONFIRMATIONS = 3; // number of blocks to wait for confirmation before calling the fulfilRandomWords function
    uint32 constant NUM_WORDS = 1;
    uint256 immutable i_subscriptionId;
    uint32 constant CALLBACK_GAS_LIMIT = 100000;
    
    // uint256 internal constant INITIAL_WAIT_TIME = 60; // wait time before raffle opens after deployment
    uint256 immutable i_interval;
    uint256 immutable i_wait_time;
    uint256 public s_lastRaffleTime;
    uint256 public immutable i_entryFee;
    address payable[] public s_raffleEntrances;
    address [] public s_funders;

    event Entry(address indexed player);
    event Funded(address indexed funder);
    event Payout(address winner, uint256 amount);

    error Raffle__invalidEntryFeeError(uint256 fee);
    error Raffle__reentryError(address player);
    error Raffle__notOpenError();
    error Raffle__funderCannotPlayError(address funder);
    error Raffle__playerCannotFundError(address player);
    error Raffle_payoutFailedError();

    modifier payEntryFee {
        if (msg.value != i_entryFee) {
            revert Raffle__invalidEntryFeeError(msg.value);
        }
        _;
    }

    modifier notFunder {
        if (addressExistsInFunders(msg.sender)) {
            revert Raffle__funderCannotPlayError(msg.sender);
        }
        _;
    }

    modifier notPlayer{
        if (addressExistsInRaffle(payable(msg.sender))) {
            revert Raffle__playerCannotFundError(msg.sender);
        }
        _;
    }

    modifier hasNotEntered {
        if (addressExistsInRaffle(payable(msg.sender))) {
            revert Raffle__reentryError(msg.sender);
        }
        _;
    }

    modifier raffleIsOpen {
        if (block.timestamp < (s_lastRaffleTime + i_wait_time)) {
            revert Raffle__notOpenError();
        }
        _;
    }

    /**
     * @param _interval the time interaval in seconds between every open raffle
     * @param _wait_time time in seconds before a new raffle is allowed
     * @param _entryFee fee to enter the raffle in wei
     */
    constructor(
        uint256 _interval, 
        uint256 _wait_time,
        uint256 _entryFee,
        uint256 _subId
    ) VRFConsumerBaseV2Plus(VRF_COORDINATOR_ADDRESS) {
        i_interval = _interval;
        i_wait_time = _wait_time;
        i_entryFee = _entryFee;
        i_subscriptionId = _subId;  
        s_lastRaffleTime = block.timestamp; 
    }

    /**
     * @dev allows users to enter the raffle by paying the Entry fee
     * @notice raffle must be open, user must not have already entered the raffle, user must not be a funder
     */
    function enterRaffle()
        external
        raffleIsOpen 
        notFunder 
        hasNotEntered 
        payEntryFee payable {
        s_raffleEntrances.push(payable(msg.sender));
        emit Entry(msg.sender);
    }

    /**
     * @notice this function is called by VRFConsumerBaseV2Plus.rawFulfillRandomWords(requestId, randomWords)
     */
    function fulfillRandomWords(uint256 /*requestId*/, uint256[] calldata randomWords) internal override {
        // select a winner from the array
        uint256 randomIndex = randomWords[0] % s_raffleEntrances.length;
        address payable winner = s_raffleEntrances[randomIndex];
        uint256 balance = address(this).balance;

        clearFunders(); // empty the array of funders for the raffle ---CHECKS
        clearPlayers(); // empty the array of raffle players

        emit Payout(winner, balance); // EFFECTS

        (bool success,) = winner.call{value: address(this).balance}(""); // INTERACTIONS

        s_lastRaffleTime = block.timestamp; // update the time the last raffle happened

        if (!success) {
            revert Raffle_payoutFailedError();
        }
    }

    /**
     * @notice this function is responsible for sending out a request to the VRF contract
     */
    function startRaffle()internal {
       uint256 requestID = s_vrfCoordinator.requestRandomWords(VRFV2PlusClient.RandomWordsRequest({
            keyHash: KEY_HASH,
            subId: i_subscriptionId,
            requestConfirmations: REQUEST_CONFIRMATIONS,
            callbackGasLimit: CALLBACK_GAS_LIMIT,
            numWords: NUM_WORDS,
            extraArgs: ""
            })
        );
    }

    /**
     * @dev allows anyone to fund the raffle
     * @notice a player in the raffle cannot fund the raffle
     */
    function fundRaffle()external raffleIsOpen notPlayer payable {
        s_funders.push(msg.sender);
        emit Funded(msg.sender);
    }

    /**
     * @notice used by chainlink to know when to perform upkeep
     * @return upkeepNeeded boolean value to signal to chainlink automation whether to perform upkeep
     */
    function checkUpkeep(bytes calldata /*checkData*/) external view returns (bool upkeepNeeded, bytes memory performData){
        if (block.timestamp >= s_lastRaffleTime + i_interval) {
            upkeepNeeded = true;
            return (upkeepNeeded, performData);
        }
        return (upkeepNeeded, performData);
    }

    function performUpkeep(bytes calldata /*performData*/) external{
        startRaffle();
    }

    /**
     * @dev checks if this player has already participated in this raffle
     * @param _player player's address
     */
    function addressExistsInRaffle(address payable _player)internal view returns(bool exists) {
        for (uint256 a; a < s_raffleEntrances.length; ++a) {
            if (s_raffleEntrances[a] == _player) {
                exists = true;
                return exists;
            }
        }
        return exists;
    }

    /**
     * @dev checks if this funder has already funded the current raffle before
     * @param _funder funder's address
     */
    function addressExistsInFunders(address _funder)internal view returns(bool exists) {
        for (uint256 a; a < s_funders.length; ++a) {
            if (s_funders[a] == _funder) {
                exists = true;
                return exists;
            }
        }
        return exists;
    }

    /**
     * @dev resets the s_funders array after payout
     */
    function clearFunders()internal {
        s_funders = new address[](0);
    }

    /**
     * @dev resets the s_raffleEntrances array after payout
     */
    function clearPlayers()internal {
        s_raffleEntrances = new address payable[](0);
    }
}