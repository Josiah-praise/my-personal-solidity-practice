//SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {TickToken} from "src/tickToken.sol";
import {TickNFT} from "src/tickNft.sol";

struct EventDetail{
    address customer;
    uint256 eventId;
    bool exists;
}

struct Event{
    uint256 priceInTickTokens;
    uint256 startTime;
    uint256 endTime;
    uint256 maxTickets;
    uint256 ticketsSold;
    string eventDetails;
    address[] registeredAddresses;
    address owner;
    bool exists;

}

contract TicketPlatform{
    string private constant TICKET_URI = "ipfs://bafkreiezbucubrae6da4zl56fjkz3migq54imbwfoc7sgbb2nfxvpj7qa4";
    uint256 public counter = 1;
    mapping(uint256 =>Event) public events;
    uint256[] public eventIds;
    TickToken public immutable i_tickTokenContract;
    TickNFT public immutable i_tickNftContract;
    mapping(uint256=>EventDetail)public s_nfts;

    error TicketPlatform__EventNotFound();
    error TicketPlatform__EventNotOpen();
    error TicketPlatform__AllowanceInsufficient();
    error TicketPlatform__TransferFailed();
    error TicketPlatform__SoldOut();
    error TicketPlatform__InvalidStartTime();
    error TicketPlatform__InvalidEndTime();
    error TicketPlatform__MaxTicketsZeroError();

    event EventCreated(uint256 indexed eventId);
    event Registration(uint256 indexed eventId, address indexed customer);


    constructor(address _tickTokenAddress, address _tickNftAddress) {
        i_tickNftContract = TickNFT(_tickNftAddress);
        i_tickTokenContract = TickToken(_tickTokenAddress);
    }

    /// @notice existence checks
    function _eventExists(uint256 eventId)internal view{
        if (!events[eventId].exists){
            revert TicketPlatform__EventNotFound();
        }
    }

    // TODO think over whether users should be able to able 
    // TODO to update their events--beats the idea behind behind immutability of the chain lol

    
    function createEvent(
        uint256 _priceInTickTokens,
        uint256 _maxTickets,
        string calldata _eventDetails,
        uint256 _startTime,
        uint256 _endTime
    )external returns(uint256 eventId) {
        // check if start time and end time is in the future
        if (_startTime < block.timestamp) {
            revert TicketPlatform__InvalidStartTime();
        }

        // check if end time is in the future
        if (_endTime < block.timestamp) {
            revert TicketPlatform__InvalidEndTime();
        }

        // max rickets must be at least one
        if (_maxTickets == 0) {
            revert TicketPlatform__MaxTicketsZeroError();
        }

        uint256 index = counter++; // index for next element
    
        // creates new event
        Event memory newEvent = Event(
            _priceInTickTokens,
             _startTime,
             _endTime,
             _maxTickets,
             0,
            _eventDetails,
            new address[](0),
            msg.sender,
            true
        );

        // update events
        events[index] = newEvent;
        eventIds.push(index);
        emit EventCreated(index);
        return index;
    }

    function getEvent(uint256 eventId)external view returns(
        uint256 priceInTickTokens,
        uint256 startTime,
        uint256 endTime,
        uint256 maxTickets,
        uint256 ticketsSold,
        string memory eventDetails
    ) {
        _eventExists(eventId);

        Event memory oldEvent = events[eventId];

        return (
            oldEvent.priceInTickTokens,
            oldEvent.startTime,
            oldEvent.endTime,
            oldEvent.maxTickets,
            oldEvent.ticketsSold,
            oldEvent.eventDetails
        );
    }

    function isRegistered(
        address customer,
        uint256 eventId,
        uint256 tokenId
    )external view returns(bool){
        _eventExists(eventId);

        if(s_nfts[tokenId].exists && s_nfts[tokenId].customer == customer) return true;
        return false;
        
    }

    function register(uint256 eventId)external returns(uint256 tokenId){
        _eventExists(eventId);

        Event memory oldEvent = events[eventId];

         // check if event is still open
        if (!(block.timestamp >= oldEvent.startTime && block.timestamp < oldEvent.endTime)) {
            revert TicketPlatform__EventNotOpen();
        }

        // check if event is already sold out
         if (oldEvent.ticketsSold >= oldEvent.maxTickets) {
            revert TicketPlatform__SoldOut();
        }

        // check whether the buyer has approved this contract to take the right amount of these tokens need for the event
        if (i_tickTokenContract.allowance(msg.sender, address(this)) < oldEvent.priceInTickTokens) {
            revert TicketPlatform__AllowanceInsufficient();
        }

        // transfer to this contract's address
        bool transferSuccess = i_tickTokenContract.transferFrom(msg.sender, address(this), oldEvent.priceInTickTokens);

        if (!transferSuccess) {
            revert TicketPlatform__TransferFailed();
        }

        // mint token
        tokenId = i_tickNftContract.safeMint(msg.sender, TICKET_URI);

        Event storage eventPointer = events[eventId];

        eventPointer.ticketsSold += 1;
        eventPointer.registeredAddresses.push(msg.sender);

        s_nfts[tokenId] = EventDetail(msg.sender, eventId, true);

        emit Registration(eventId, msg.sender);

        return tokenId;
        
    }

    // function 
}