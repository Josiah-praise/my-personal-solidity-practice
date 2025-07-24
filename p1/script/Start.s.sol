// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Start} from "../src/Start.sol";

contract StartScript is Script {
    Start public start;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        start = new Start();

        vm.stopBroadcast();
    }
}
