# CrowdFund: A Decentralized Crowdfunding Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity Version](https://img.shields.io/badge/solidity-^0.8.0-lightgrey)](https://soliditylang.org/)
[![Built with Foundry](https://img.shields.io/badge/Built%20with-Foundry-FF0000?style=for-the-badge&logo=foundry&logoColor=white)](https://book.getfoundry.sh/)

A fully-decentralized, secure, and transparent crowdfunding smart contract built on the Ethereum Virtual Machine (EVM). This contract allows users to create fundraising campaigns with specific goals and deadlines. Donors can contribute funds, and the platform ensures that funds are handled securely: campaign creators can only withdraw funds if the goal is met, and donors can claim a full refund if the campaign fails to meet its goal.

The contract leverages **Chainlink Price Feeds** to peg campaign goals and minimum donation amounts to a stable USD value, protecting campaigns from the volatility of ETH.

## Key Features

-   **Create Campaigns**: Anyone can create a campaign with a USD-denominated goal, minimum donation amount, and a set duration.
-   **Fund Campaigns**: Users can donate ETH to any open campaign. The contract ensures donations meet the required minimum.
-
-   **Secure Withdrawals**: Campaign owners can only withdraw the collected funds after the campaign deadline has passed AND the funding goal has been successfully met.
-
-   **Guaranteed Refunds**: If a campaign does not meet its funding goal by the deadline, all donors can safely withdraw their exact contributed amount.
-   **On-Chain Transparency**: All campaign details, donations, and state changes are publicly verifiable on the blockchain.
-   **Re-Entrancy Protection**: Implements the Checks-Effects-Interactions pattern to prevent common re-entrancy attacks.


## How It Works

The contract logic is built around the `Campaign` struct, which tracks all necessary information for a single fundraising campaign. The core workflow is as follows:

1.  **Creation**: A user calls `createCampaign()`, providing a goal and minimum donation in USD, along with a deadline (as a future Unix timestamp). The contract uses a Chainlink Price Feed to convert these USD values into their Wei equivalents at the time of creation, locking them in.
2.  **Funding**: While the campaign is active (`block.timestamp < epochDate`), users can call the `fund()` function with `msg.value` (ETH) to donate. The contract validates that the donation meets the minimum requirement.
3.  **Conclusion**: Once the `epochDate` passes, the campaign is closed.
    -   **If `purse >= goalInWei`**: The campaign is marked as `Fulfilled`. The `owner` can then call `withdraw()` to receive all the funds.
    -   **If `purse < goalInWei`**: The campaign is marked as `Unfulfilled`. Any donor can then call `refund()` to have their specific contribution returned to them.

## Contract API Reference

### Structs

**`Campaign`**
```solidity
struct Campaign {
    address owner;
    uint256 minimumDonationInWei;
    uint256 goalInWei;
    uint256 purse; // Total funds collected
    uint256 epochDate; // Deadline
    string details;
    Fulfillment fulfillment; // unfulfilled or fulfilled
    mapping(address => uint256) senderDonations; // Tracks individual donations
}
```

### Public Functions

-   `createCampaign(uint256 _minimumDonationInUSD, uint256 _goal, string calldata _details, uint256 _epochDate)`: Creates a new campaign.
-   `fund(uint256 _index)`: Allows a user to donate ETH to a campaign specified by its index. Must be `payable`.
-   `withdraw(uint256 _index)`: Allows the campaign owner to withdraw all collected funds if the campaign was successful.
-   `refund(uint256 _index)`: Allows a donor to claim a refund if the campaign failed to meet its goal.

### Custom Errors

-   `IncorrectDurationError()`: Reverts if `_epochDate` is in the past.
-   `ZeroGoalError()`: Reverts if the campaign goal is zero.
-   `CampaignNotFoundError()`: Reverts if the specified campaign index does not exist.
-   `BelowMinimumUSDError()`: Reverts if a donation is less than the campaign's minimum.
-   `CampaignClosedError()`: Reverts if trying to fund a campaign that has already ended.
-   `CampaignNotClosedError()`: Reverts if trying to withdraw or refund before a campaign has ended.
-   `GoalNotMetError()`: Reverts if the owner tries to withdraw from an unsuccessful campaign.
-   `GoalMetError()`: Reverts if a donor tries to get a refund from a successful campaign.
-   `UnAuthorizedError()`: Reverts if a non-owner tries to call `withdraw`.
-   `NoDonationError()`: Reverts if a user tries to claim a refund but has no donation history for that campaign.
-   `WithdrawalError()` / `RefundError()`: Reverts if the ETH transfer fails for an unknown reason.

### Events

-   `CreateCampaign(...)`: Emitted when a new campaign is created.
-   `Fund(...)`: Emitted when a donation is made.
-   `Withdrawal(...)`: Emitted when an owner successfully withdraws funds.
-   `Refund(...)`: Emitted when a donor successfully claims a refund.