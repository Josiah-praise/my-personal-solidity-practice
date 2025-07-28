// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {CrowdFund} from "../src/CrowdFund.sol";
import {Fulfillment} from "../src/enums/Fulfillment.sol";
import {MockV3Aggregator} from "./mocks/MockV3Aggregator.sol";
import {PriceConverter} from "../src/library/PriceConverter.lib.sol";

contract CrowdFundTest is Test{
    using PriceConverter for uint256;

    CrowdFund instance;
    MockV3Aggregator priceFeed;
    int256 constant ETH_TO_DOLLAR_PRICE = 3770e8;

    address ricky;
    address james;
    address john;

    // TODO test for emitted events
    function setUp()external {
        // deploy the mock first
        priceFeed = new MockV3Aggregator(ETH_TO_DOLLAR_PRICE);

        // deploy the crowdfund contract
        instance = new CrowdFund(address(priceFeed));

        // setup users to interact with the contract
        ricky = makeAddr("Ricky");
        james = makeAddr("james");
        john = makeAddr("john");
    }

    function test_createCampaign()external  {
        uint256 _minimumDonationInUSD = 5;
        uint256 _goalInUSD = 1_500;
        uint256 _epochDate = 1753902857;
        string memory _details = "Test campaign";

        (,int256 oneETHToUSDUnits,,,) = priceFeed.latestRoundData(); // get mock price of 1 ether to USD units


        uint256 _minimumDonationInWei = _minimumDonationInUSD.convertFromUSDToWei(priceFeed.decimals(), uint256(oneETHToUSDUnits)); // convert minimumDonationUsd to wei using mock price feed

        uint256 _goalInWei = _goalInUSD.convertFromUSDToWei( priceFeed.decimals(), uint256(oneETHToUSDUnits));

        vm.startPrank(ricky); // switch to ricky
        instance.createCampaign(_minimumDonationInUSD, _goalInUSD, _details, _epochDate);
        vm.stopPrank();

        (uint256 minimumDonationInWei, uint256 goalInWei, , uint256 epochDate, string memory details, ,) = instance.campaigns(0);

        assertEq(minimumDonationInWei, _minimumDonationInWei);
        assertEq(goalInWei, _goalInWei);
        assertEq(epochDate, _epochDate);
        assertEq(details, _details);
    }

    function test_Reverts_createCampaign_When_epochDate_isNotFutureDate()external {
        uint256 _minimumDonationInUSD = 5;
        uint256 _goalInUSD = 1_500;
        uint256 _epochDate =  block.timestamp - 1;
        string memory _details = "Test campaign";

        vm.expectRevert(CrowdFund.IncorrectDurationError.selector);
        instance.createCampaign(_minimumDonationInUSD, _goalInUSD, _details, _epochDate);

    }

    function test_Reverts_createCampaign_When_goalIsZero()external {
        uint256 _minimumDonationInUSD = 5;
        uint256 _goalInUSD = 0;
        uint256 _epochDate =  block.timestamp + 1;
        string memory _details = "Test campaign";

        vm.expectRevert(CrowdFund.ZeroGoalError.selector);
        instance.createCampaign(_minimumDonationInUSD, _goalInUSD, _details, _epochDate);
    }

    function test_fund()external {
        uint256 _minimumDonationInUSD = 5;
        uint256 _goalInUSD = 1_500;
        uint256 _epochDate =  block.timestamp + 1;
        string memory _details = "Test campaign";

        uint256 _index = instance.createCampaign(_minimumDonationInUSD, _goalInUSD, _details, _epochDate);

        uint256 amount = 1_591_511_936_339_522; // 6 dollar in wei using ETH_TO_DOLLAR_PRICE 

        // give ricky and james some ether to fund with
        vm.deal(ricky, 1 ether);
        vm.deal(james, 1 ether);

        // switch to ricky
        vm.startPrank(ricky);
        instance.fund{value: amount}(_index);
        vm.stopPrank();

        // switch to james
        vm.startPrank(james);
        instance.fund{value: amount}(_index);
        vm.stopPrank();

        (,,uint256 purse,,,,) = instance.campaigns(_index);

        assertEq(purse, amount*2); 


        vm.startPrank(ricky);
        assertEq(amount, instance.getMyDonation(_index));
        vm.stopPrank();

        vm.startPrank(james);
        assertEq(amount, instance.getMyDonation(_index));
        vm.stopPrank();
    }

    function test_RevertsWhen_campaignDoesNotExist()external {
        uint256 _minimumDonationInUSD = 5;
        uint256 _goalInUSD = 1_500;
        uint256 _epochDate =  block.timestamp + 1;
        string memory _details = "Test campaign";

        uint256 _index = instance.createCampaign(_minimumDonationInUSD, _goalInUSD, _details, _epochDate);

        uint256 amount = 1_591_511_936_339_522; // 6 dollar in wei using ETH_TO_DOLLAR_PRICE 

        // give ricky ether to fund with
        vm.deal(ricky, 1 ether);


        vm.expectRevert(CrowdFund.CampaignNotFoundError.selector);
        // switch to ricky
        vm.startPrank(ricky);
        instance.fund{value: amount}(_index+1);
        vm.stopPrank();
    }

    function test_RevertsWhen_campaignIsNotOpen()external {
        uint256 _minimumDonationInUSD = 5;
        uint256 _goalInUSD = 1_500;
        uint256 _epochDate =  block.timestamp + 1;
        string memory _details = "Test campaign";

        uint256 _index = instance.createCampaign(_minimumDonationInUSD, _goalInUSD, _details, _epochDate);

        skip(1 days); // close the campaign

        uint256 amount = 1_591_511_936_339_522; // 6 dollar in wei using ETH_TO_DOLLAR_PRICE rate

        // give ricky ether to fund with
        vm.deal(ricky, 1 ether);


        vm.expectRevert(CrowdFund.CampaignClosedError.selector);
        // switch to ricky
        vm.startPrank(ricky);
        instance.fund{value: amount}(_index);
        vm.stopPrank();
    }

    function test_Reverts_If_MinimumUSDRequirementNotMet()external {
        uint256 _minimumDonationInUSD = 5;
        uint256 _goalInUSD = 1_500;
        uint256 _epochDate =  block.timestamp + 1;
        string memory _details = "Test campaign";

        uint256 _index = instance.createCampaign(_minimumDonationInUSD, _goalInUSD, _details, _epochDate);

        uint256 amount = 265_251_989_389_920; // 1 dollar in wei using ETH_TO_DOLLAR_PRICE rate

        // give ricky ether to fund with
        vm.deal(ricky, 1 ether);


        vm.expectRevert(CrowdFund.BelowMinimumUSDError.selector);
        // switch to ricky
        vm.startPrank(ricky);
        instance.fund{value: amount}(_index);
        vm.stopPrank();
    }

    function test_Withdraw()external {
        uint256 _minimumDonationInUSD = 5;
        uint256 _goalInUSD = 1_500;
        uint256 _epochDate =  block.timestamp + 1;
        string memory _details = "Test campaign";

        // owner
        vm.startPrank(james);
        uint256 _index = instance.createCampaign(_minimumDonationInUSD, _goalInUSD, _details, _epochDate);
        vm.stopPrank();

        uint256 amount = 1 ether; 

        // give ricky some ether to fund with
        vm.deal(ricky, 2 ether);

        // switch to ricky
        vm.startPrank(ricky);
        instance.fund{value: amount}(_index);
        vm.stopPrank();

        skip(1 days); // close the campaign
        vm.startPrank(james);
        uint256 jamesInitialBalance = james.balance;

        (,,uint256 purseBeforeWithdrawal,,,,) = instance.campaigns(_index);

        bool success = instance.withdraw(_index);

        (,,uint256 purseAfterWithdrawal,,,,) = instance.campaigns(_index);
        vm.stopPrank();
        
        assertTrue(success);
        assertEq(james.balance - jamesInitialBalance, purseBeforeWithdrawal);
        assertEq(purseAfterWithdrawal, 0);
    }

    function test_RevertWithdrawWhen_campaignDoesNotExist()external {
        vm.expectRevert(CrowdFund.CampaignNotFoundError.selector);
        instance.withdraw(0);
    }

    function test_RevertWithdrawWhen_NotOwner()external {
    uint256 _minimumDonationInUSD = 5;
    uint256 _goalInUSD = 1_500;
    uint256 _epochDate =  block.timestamp + 1;
    string memory _details = "Test campaign";

    // owner
    vm.startPrank(james);
    uint256 _index = instance.createCampaign(_minimumDonationInUSD, _goalInUSD, _details, _epochDate);
    vm.stopPrank();

    uint256 amount = 1 ether; 

    // give ricky some ether to fund with
    vm.deal(ricky, 2 ether);

    // switch to ricky
    vm.startPrank(ricky);
    instance.fund{value: amount}(_index);
    vm.stopPrank();

    skip(1 days); // close the campaign

    vm.expectRevert(CrowdFund.UnAuthorizedError.selector);
    vm.prank(john);
    instance.withdraw(_index);
    }

    function test_RevertWithdrawWhen_isNotClosed()external {
        uint256 _minimumDonationInUSD = 5;
        uint256 _goalInUSD = 1_500;
        uint256 _epochDate =  block.timestamp + 1;
        string memory _details = "Test campaign";

        // owner
        vm.startPrank(james);
        uint256 _index = instance.createCampaign(_minimumDonationInUSD, _goalInUSD, _details, _epochDate);
        vm.stopPrank();

        uint256 amount = 1 ether; 

        // give ricky some ether to fund with
        vm.deal(ricky, 2 ether);

        // switch to ricky
        vm.startPrank(ricky);
        instance.fund{value: amount}(_index);
        vm.stopPrank();

        vm.expectRevert(CrowdFund.CampaignNotClosedError.selector);
        vm.prank(james);
        instance.withdraw(_index);
    }

    function test_RevertWithdrawWhen_GoalNotMet()external {
        uint256 _minimumDonationInUSD = 5;
        uint256 _goalInUSD = 1_500;
        uint256 _epochDate =  block.timestamp + 1;
        string memory _details = "Test campaign";

        // owner
        vm.startPrank(james);
        uint256 _index = instance.createCampaign(_minimumDonationInUSD, _goalInUSD, _details, _epochDate);
        vm.stopPrank();

        uint256 amount = 1_591_511_936_339_522; 

        // give ricky some ether to fund with
        vm.deal(ricky, 1 ether);

        // switch to ricky
        vm.startPrank(ricky);
        instance.fund{value: amount}(_index);
        vm.stopPrank();

        skip(1 days); // close the campaign

        vm.expectRevert(CrowdFund.GoalNotMetError.selector);
        vm.prank(james);
        instance.withdraw(_index);
    }

    function test_Refund()external {
        uint256 _minimumDonationInUSD = 5;
        uint256 _goalInUSD = 10_000;
        uint256 _epochDate =  block.timestamp + 1;
        string memory _details = "Test campaign";

        // owner
        vm.startPrank(james);
        uint256 _index = instance.createCampaign(_minimumDonationInUSD, _goalInUSD, _details, _epochDate);
        vm.stopPrank();

        uint256 amount = 1 ether; 

        // give ricky some ether to fund with
        vm.deal(ricky, 2 ether);

        // switch to ricky
        vm.startPrank(ricky);
        instance.fund{value: amount}(_index);
        vm.stopPrank();

        skip(1 days); // close the campaign
        vm.startPrank(ricky);
        uint256 rickysInitialBalance = ricky.balance;

        (,,uint256 purseBeforeWithdrawal,,,,) = instance.campaigns(_index);

        bool success = instance.refund(_index);

        uint256 myDonationAfterRefund = instance.getMyDonation(_index);

        (,,uint256 purseAfterWithdrawal,,,,) = instance.campaigns(_index);
        vm.stopPrank();
        
        
        assertTrue(success); 
        assertEq(amount, purseBeforeWithdrawal - purseAfterWithdrawal);
        assertEq(ricky.balance, amount + rickysInitialBalance);
        assertEq(myDonationAfterRefund, 0);
    }

    function test_RevertsRefundWhen_CampaignDoesNotExist()external {
       vm.expectRevert(CrowdFund.CampaignNotFoundError.selector);
       vm.prank(james);
       instance.refund(0);
    }

    function test_RevertsRefundWhen_CampaignIsNotClosed()external {
        uint256 _minimumDonationInUSD = 5;
        uint256 _goalInUSD = 10_000;
        uint256 _epochDate =  block.timestamp + 1;
        string memory _details = "Test campaign";

        // owner
        vm.startPrank(james);
        uint256 _index = instance.createCampaign(_minimumDonationInUSD, _goalInUSD, _details, _epochDate);
        vm.stopPrank();

        uint256 amount = 1 ether; 

        // give ricky some ether to fund with
        vm.deal(ricky, 2 ether);

        // switch to ricky
        vm.startPrank(ricky);
        instance.fund{value: amount}(_index);
        vm.stopPrank();

       
       vm.expectRevert(CrowdFund.CampaignNotClosedError.selector);
        vm.startPrank(ricky);
       
        instance.refund(_index);

        vm.stopPrank();
    }

    function test_RevertsRefundWhen_GoalIsNotMet()external {
        uint256 _minimumDonationInUSD = 5;
        uint256 _goalInUSD = 10_000;
        uint256 _epochDate =  block.timestamp + 1;
        string memory _details = "Test campaign";

        // owner
        vm.startPrank(james);
        uint256 _index = instance.createCampaign(_minimumDonationInUSD, _goalInUSD, _details, _epochDate);
        vm.stopPrank();

        uint256 amount = 1_591_511_936_339_522; 

        // give ricky some ether to fund with
        vm.deal(ricky, 2 ether);

        // switch to ricky
        vm.startPrank(ricky);
        instance.fund{value: amount}(_index);
        vm.stopPrank();

        skip(1 days); // close the campaign
        vm.startPrank(ricky);
        instance.refund(_index);
        vm.stopPrank();
    }
}