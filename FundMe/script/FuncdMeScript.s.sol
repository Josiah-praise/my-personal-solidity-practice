// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console} from 'forge-std/Script.sol';
import {FundMe} from "../src/FundMe.sol";

contract FundMeScript is Script{
    FundMe fundme;

    function run()public {
        vm.startBroadcast();

        fundme = new FundMe(0x694AA1769357215DE4FAC081bf1f309aDC325306
,0xa5526DF9eB2016D3624B4DC36a91608797B5b6d5,5);
        vm.stopBroadcast();
    }
}