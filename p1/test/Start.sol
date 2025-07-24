// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Start} from "../src/Start.sol";

contract CounterTest is Test {
    Start public start;

    function setUp() public {
        start = new Start();
    }

    function testSetName()public {
        start.setName("Praise");
        assertEq(start.name(), "Praise");
    }

    function testGetName()public {
        start.setName("Noname");
        assertEq(start.name(), "Noname");
    }
}
