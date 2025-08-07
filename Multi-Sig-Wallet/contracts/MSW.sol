//SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Transaction} from "./structs/transaction.sol";

///@notice a multisig wallet. This wallet has a set number of owners and requires
/// approval from the owners. The number of approvals required must be at 
/// least equal to the confirmation threshold
contract MultiSigWallet{
    mapping(bytes4=>mapping(address=>bool)) public confirmations;
    mapping(bytes4=> Transaction) public transactions_map;
    bytes4[] public transaction_ids;

    uint public immutable i_confirmationThreshold;
    mapping(address=>bool) public isOwner;

    error MSG__UnAuthorized();
    error MSG__ProposalNotFound();
    error MSG__ProposalAlreadyExecuted();
    error MSG__ProposalThresholdNotMet();
    error MSG__InsufficientFunds();
    error MSG__ZeroAddressError();
    error MSG__ExecutionFailed();
    error MSG__AlreadyExecuted();

    event Proposal(bytes4 indexed transactionId);
    event Approval(address indexed approver, bytes4 indexed transactionID);
    event Execution(bytes4 indexed transactionId);

    /// @notice ensures only owners have access control
    modifier onlyOwner{
        if(!isOwner[msg.sender]) 
            revert MSG__UnAuthorized();
        _;
    }

    constructor(address[] memory owners, uint threshold) {
        if (owners.length == 0) {
            revert("Must pass at least one owner");
        }
        if (threshold > owners.length){
            revert("Threshold cannot be more than the number of owners");
        }
        if (threshold == 0) {
            revert("Threshold cannot be 0");
        }
        
        for(uint i; i < owners.length; ++i) {
            isOwner[owners[i]] = true;
        }
        i_confirmationThreshold = threshold;
    }

    /// @notice submit a proposal for approval by the owners
    function submitProposal(
        uint value,
        bytes calldata data,
        address to
    )external returns(bytes4){
        if (to == address(0)){
            revert MSG__ZeroAddressError();
        }
        // get next index
        uint nextIndex;
        
        if (transaction_ids.length > 0)
            nextIndex = transaction_ids.length;
        
        // create transaction
        Transaction memory transaction = Transaction(value, 0, nextIndex, data, to, true, false);
        // create key
        bytes4 transaction_id = bytes4(keccak256(abi.encodePacked(msg.sender, block.timestamp)));
        // add new id to array
        transaction_ids.push(transaction_id);

        // add transaction to transactions_map
        transactions_map[transaction_id] = transaction;

        emit Proposal(transaction_id);

        return transaction_id;
    }

    /// @notice approve a proposal...only owners can approve proposals
    function approveProposal(bytes4 proposalID)external onlyOwner {
        if(transactions_map[proposalID].exists != true) {
            revert MSG__ProposalNotFound();
        }
        if(transactions_map[proposalID].executed) {
            revert MSG__ProposalAlreadyExecuted();
        }

        if (!confirmations[proposalID][msg.sender]) {
            confirmations[proposalID][msg.sender] = true;
            transactions_map[proposalID].numberOfConfirmations += 1;
            emit Approval(msg.sender, proposalID);
        }
    }

    /// @notice execute a proposal if it meets the confirmation threshold
    function executeProposal(bytes4 proposalID)external {
        if(transactions_map[proposalID].exists != true) {
            revert MSG__ProposalNotFound();
        }
        if (transactions_map[proposalID].executed) {
            revert MSG__ProposalAlreadyExecuted();
        }
        if (transactions_map[proposalID].numberOfConfirmations < i_confirmationThreshold){
            revert MSG__ProposalThresholdNotMet();
        }
        if (transactions_map[proposalID].value > address(this).balance) {
            revert MSG__InsufficientFunds();
        }
        Transaction memory transaction = transactions_map[proposalID];

        transaction.executed = true;

        // execute transaction
        (bool success,) = transaction.to.call{value: transaction.value}(transaction.data);

        if (!success) {
            revert MSG__ExecutionFailed();
        }
        emit Execution(proposalID);
    }

    /// @notice for receiving eth into the contract's account
    receive() external payable {}
}