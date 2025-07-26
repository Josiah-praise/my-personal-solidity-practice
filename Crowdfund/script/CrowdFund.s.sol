// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {CrowdFund} from "../src/CrowdFund.sol";

contract CrowdFundScript is Script{
    CrowdFund instance;

    function run()external {
        vm.startBroadcast();
        instance = new CrowdFund(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        vm.stopBroadcast();
    }
}