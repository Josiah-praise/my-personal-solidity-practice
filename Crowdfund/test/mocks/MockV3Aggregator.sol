// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract MockV3Aggregator is AggregatorV3Interface {
    uint8 public constant DECIMALS = 8;
    int256 public latestAnswer;

    constructor(int256 _initialAnswer) {
        latestAnswer = _initialAnswer;
    }

    function decimals() external pure override returns (uint8) {
        return DECIMALS;
    }

    function latestRoundData()
        external
        view
        override
        returns (
            uint80, // roundId
            int256, // answer
            uint256, // startedAt
            uint256, // updatedAt
            uint80 // answeredInRound
        )
    {
        return (1, latestAnswer, block.timestamp, block.timestamp, 1);
    }

    // --- Unused functions ---
    function description() external pure override returns (string memory) {
        return "Mock ETH/USD";
    }

    function version() external pure override returns (uint256) {
        return 1;
    }

    function getRoundData(
        uint80
    )
        external
        view
        override
        returns (
            uint80,
            int256,
            uint256,
            uint256,
            uint80
        )
    {
        return (1, latestAnswer, block.timestamp, block.timestamp, 1);
    }
}