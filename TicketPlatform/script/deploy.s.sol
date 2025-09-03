//SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import { TicketPlatform} from "src/ticketplatform.sol";
import {TickNFT} from "src/tickNft.sol";
import {TickToken} from "src/tickToken.sol";
import {TickTokenShop} from "src/tickTokenShop.sol";

contract DeployScript is Script {
    address public constant MY_ADDRESS = 0xa5526DF9eB2016D3624B4DC36a91608797B5b6d5;
    uint256 public constant PRICE = 1e9; // price per token in wei
    function run()external {

        vm.startBroadcast();
        // deploy nft and ticktoken
       TickToken tokenInstance = new TickToken("TickToken", "TCK", MY_ADDRESS);
       TickNFT nftInstance = new TickNFT("TickNFT", "TCKNFT", MY_ADDRESS);

       console.log(address(tokenInstance));
       console.log(address(nftInstance));

       // deploy shop
       TickTokenShop shopInstance = new TickTokenShop(MY_ADDRESS, address(tokenInstance), PRICE);
        console.log(address(shopInstance));
        // transfer token ownership to shop so that it can mint when it needs to sell
         tokenInstance.transferOwnership(address(shopInstance));

        // deploy ticket platform
        TicketPlatform platformInstance = new TicketPlatform(address(tokenInstance), address(nftInstance));
        console.log(address(platformInstance));
        // tranfer ownership of nft to ticket platform so that it can mint nfts for events
        nftInstance.transferOwnership(address(platformInstance));
        vm.stopBroadcast();
    }
}