//SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {TickToken} from "src/tickToken.sol";



contract TickTokenShop is Ownable{
    uint256 internal s_token_price_per_token; // this is the price in wei per 1e18 units of tickToken
    TickToken internal immutable i_tokenContract;

    error TickTokenShop__InsufficientPayment();
    error TickTokenShop__OutOfTokens();
    error TickTokenShop__InsufficientTokens();
    error TickTokenShop__TokenTransferFailed();

    event Payment(uint256 indexed amount);

    /// @notice checks that the msg.value > price of required amount
    modifier meetsPriceRate(uint256 amount) {
        // do calculation
        // s_x => 1e18
        // x => amount
        uint256 totalPrice = amount * s_token_price_per_token / 1e18;
        if (msg.value < totalPrice) {
            revert TickTokenShop__InsufficientPayment();
        }
        _;
    }


    /// @param _owner owner of this contract's address
    /// @param _tickTokenAddress address of tickToken contract
    /// @param _initialTokenPrice price per token
    constructor(address _owner,  address _tickTokenAddress, uint256 _initialTokenPrice) Ownable(_owner) {
        i_tokenContract = TickToken(_tickTokenAddress);
        s_token_price_per_token = _initialTokenPrice;
    }

    function getTokenShopBalance()external view returns(uint256 amount) {
        return i_tokenContract.balanceOf(address(this));
    }

    // function buyToken(uint256 amount)external meetsPriceRate(amount) payable returns(bool successful){
    //     // ensure shop is not out of tokens
    //     if (i_tokenContract.balanceOf(address(this)) == 0) {
    //         revert TickTokenShop__OutOfTokens();
    //     }
    //     // ensure shop has as much tokens as the buyer needs
    //     if (i_tokenContract.balanceOf(address(this)) < amount) {
    //         revert TickTokenShop__InsufficientTokens();
    //     }

    //     // transfer tokens
    //     successful = i_tokenContract.transfer(msg.sender, amount);

    //     if (!successful) {
    //         revert TickTokenShop__TokenTransferFailed();
    //     }

    //     emit Payment(msg.value);
    //     return successful;
    // }

     function buyToken(uint256 amount)external meetsPriceRate(amount) payable returns(bool successful){
        // // ensure shop is not out of tokens
        // if (i_tokenContract.balanceOf(address(this)) == 0) {
        //     revert TickTokenShop__OutOfTokens();
        // }
        // // ensure shop has as much tokens as the buyer needs
        // if (i_tokenContract.balanceOf(address(this)) < amount) {
        //     revert TickTokenShop__InsufficientTokens();
        // }

        // mint the tokens directly instead
        i_tokenContract.mint(address(this), amount);

        // transfer tokens 
        successful = i_tokenContract.transfer(msg.sender, amount);

        if (!successful) {
            revert TickTokenShop__TokenTransferFailed();
        }

        emit Payment(msg.value);
        return successful;
    }

    function setTokenPrice(uint256 amount)external onlyOwner {
        s_token_price_per_token = amount;
    }

    function getTokenPrice()external view returns(uint256) {
        return s_token_price_per_token;
    }
    
}