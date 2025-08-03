// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script} from "forge-std/Script.sol";
import {CrowdFund} from "../src/CrowdFund.sol";

contract CrowdFundScript is Script {
    CrowdFund instance;
    function run()public {

        vm.startBroadcast();
        instance = new CrowdFund();
        vm.stopBroadcast();
    }
}