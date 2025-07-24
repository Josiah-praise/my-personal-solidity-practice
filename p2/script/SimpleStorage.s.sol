// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SimpleStorageFactory} from "../src/SimpleStorage.sol";

contract SimpleStorageFactoryScript is Script {
    SimpleStorageFactory public simplestorefactory;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        simplestorefactory = new SimpleStorageFactory();
        vm.stopBroadcast();
    }
}
