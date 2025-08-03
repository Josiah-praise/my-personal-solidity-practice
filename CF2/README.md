# CrowdFund Smart Contract

A decentralized crowdfunding platform built on Ethereum that allows users to create campaigns, accept donations, and manage withdrawals/refunds based on campaign success.

## 📋 Overview

The CrowdFund contract enables:
- **Campaign Creation**: Users can create funding campaigns with specific goals and durations
- **Donations**: Anyone can donate ETH to active campaigns
- **Withdrawals**: Campaign owners can withdraw funds if goals are met after campaign ends
- **Refunds**: Donors can claim refunds if campaigns fail to meet their goals

## 🏗️ Contract Architecture

### Core Components

- **CrowdFund.sol**: Main contract handling campaign management
- **CrowdFundLibrary.sol**: Utility library for campaign state checks
- **Campaign struct**: Stores campaign data including owner, goal, duration, and donors
- **Donor struct**: Tracks individual donor contributions
- **State enum**: Manages campaign states (MET/NOT_MET)

### Data Structures

```solidity
struct Campaign {
    address owner;
    uint256 fundingGoal;
    uint256 durationInDays;
    uint256 createdAt;
    bool exists;
    uint256 purse;
    mapping(address => Donor) addressToDonors;
    Donor[] donors;
    State state;
}

struct Donor {
    uint256 index;
    uint256 amount;
    bool exists;
}

enum State {
    NOT_MET,
    MET
}
```

## 🔧 Core Functions

### Campaign Management

| Function | Description | Access |
|----------|-------------|---------|
| `createCampaign(uint256 _fundingGoal, uint256 _durationInDays)` | Creates a new crowdfunding campaign | Public |
| `getCampaignDetails(bytes4 campaignID)` | Returns campaign information | View |
| `getCampaignDonors(bytes4 campaignID)` | Returns list of campaign donors | View |

### Donations & Funding

| Function | Description | Access |
|----------|-------------|---------|
| `donate(bytes4 _campaignID)` | Donate ETH to an active campaign | Payable |
| `withdrawFromCampaign(bytes4 campaignID)` | Withdraw funds from successful campaign | Owner Only |
| `getRefund(bytes4 campaignID)` | Claim refund from failed campaign | Donor Only |

## 📜 Business Logic

### Campaign Creation
- Generates unique campaign ID using `keccak256(msg.sender, block.timestamp)`
- Stores campaign in both array and mapping for efficient access
- Emits `CampaignCreated` event

### Donation Process
1. Validates campaign exists and is still fundable
2. Updates donor records (creates new or adds to existing)
3. Increases campaign purse
4. Automatically updates state to `MET` if funding goal reached
5. Emits `Donation` event

### Withdrawal Rules
- Only campaign owner can withdraw
- Campaign must be closed (duration expired)
- Funding goal must be met
- Transfers entire purse to owner
- Emits `Withdrawal` event

### Refund Process
- Only donors can claim refunds
- Campaign must be closed and goal NOT met
- Removes donor from array using swap-and-pop pattern
- Transfers donated amount back to donor
- Emits `Refund` event

## 🛡️ Security Features

### Access Control
- `onlyOwner` modifier: Restricts withdrawal to campaign creators
- `onlyDonor` modifier: Restricts refunds to actual donors
- Campaign existence validation on all operations

### Error Handling
- `CampaignClosedError`: Campaign no longer accepting donations
- `CampaignNotFoundError`: Invalid campaign ID
- `GoalNotMetError`: Withdrawal attempted on failed campaign
- `UnAuthorized`: Access denied for restricted functions
- `CampaignNotClosedError`: Operation attempted on active campaign
- `WithdrawalError`: ETH transfer failed during withdrawal
- `GoalMetError`: Refund attempted on successful campaign
- `RefundError`: ETH transfer failed during refund

### Best Practices
- Uses `call` for ETH transfers instead of deprecated methods
- Implements checks-effects-interactions pattern
- Efficient donor management with swap-and-pop deletion
- Comprehensive event logging for transparency

## 📊 Events

```solidity
event CampaignCreated(address indexed owner, bytes4 indexed campaignID);
event Donation(address indexed donor, bytes4 indexed campaignID, uint256 amount);
event Withdrawal(address indexed owner, uint256 amount, bytes4 indexed campaignID);
event Refund(address indexed donor, uint256 amount);
```

## 🌐 Deployment

**Network**: Ethereum Sepolia Testnet  
**Block Explorer**: [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x4943a769b8ec269b43140ece1db229d231f893e1)

## 📖 Usage Examples

### Creating a Campaign
```solidity
// Create a campaign with 1 ETH goal for 30 days
crowdFund.createCampaign(1 ether, 30);
```

### Making a Donation
```solidity
// Donate 0.1 ETH to campaign
crowdFund.donate{value: 0.1 ether}(campaignID);
```

### Withdrawing Funds
```solidity
// Campaign owner withdraws after successful campaign
crowdFund.withdrawFromCampaign(campaignID);
```

### Getting a Refund
```solidity
// Donor claims refund from failed campaign
crowdFund.getRefund(campaignID);
```

## ⚠️ Important Notes

- Campaign IDs are generated as `bytes4` values from hashed owner address and timestamp
- All time calculations use Unix timestamps and day conversions
- Failed campaigns allow refunds only after the duration expires
- Successful campaigns allow withdrawals only after the duration expires
- Donor array uses efficient swap-and-pop deletion to maintain gas efficiency

## 🔍 Library Functions

The `CrowdFundLibrary` provides utility functions:
- `isFundable()`: Checks if campaign is active and accepting donations
- `isWithdrawable()`: Checks if campaign is ready for owner withdrawal

---

*This contract provides a transparent and secure way to manage decentralized crowdfunding campaigns on the Ethereum blockchain.*