# Community Vault Smart Contract

A decentralized, time-locked vault for pooling community funds in Ether.

## How It Works

This smart contract enforces a specific set of rules for managing community deposits, ensuring fairness and security for all participants.

### Core Logic

1.  **Deposits:** Anyone can deposit any amount of Ether into the vault at any time. The contract meticulously tracks the total amount contributed by each unique address.

2.  **Global Time Lock:** A single, vault-wide lock-up period of **30 days** begins the moment the very first deposit is made. No withdrawals are possible from any user until this global timer has expired.

3.  **Secure Withdrawals:** After the 30-day lock-up period is over, users are free to withdraw their funds. The contract guarantees that a user can only withdraw up to the total amount they have personally deposited, preventing them from accessing funds contributed by others.

## View on Sepolia

The verified source code for this contract can be viewed on the Lisk Sepolia block explorer:

- **[View Contract on Blockscout](https://sepolia-blockscout.lisk.com/address/0x9a4A51eA1be8c298E84B687747eDC07ba0a1a47A#code)**

## Disclaimer

This smart contract is provided for educational and demonstrational purposes only. It is a learning project and has not been subjected to a formal security audit. Do not use in a production environment without further testing and professional review.