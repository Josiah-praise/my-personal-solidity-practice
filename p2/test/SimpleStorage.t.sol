// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {SimpleStorageFactory} from "../src/SimpleStorage.sol";

contract StorageFactoryTest is Test {
    SimpleStorageFactory public simpleStorefactory;

    function setUp() public {
        simpleStorefactory = new SimpleStorageFactory();
        simpleStorefactory.sfSet(3);
    }

    function testGet()public view{
        assertEq(simpleStorefactory.sfGet(), 3);
    }

    function testSet()public {
        simpleStorefactory.sfSet(22);
        assertEq(simpleStorefactory.sfGet(), 22);
    }
}
