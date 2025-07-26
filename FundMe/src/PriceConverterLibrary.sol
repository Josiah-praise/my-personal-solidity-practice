// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library PriceConverter{

    ///@notice converts ussd to wei
    ///@param _usd amount in USD
    ///@param decimals USD decimals
    ///@param oneETHToUSD  one ETH in USD
    function convertFromUSDToWei(uint256 _usd, uint256 decimals, uint256 oneETHToUSD)external pure returns(uint256){
        // 1e18 -> oneETHToUSD
        // x wei -> _usd * (10 ** decimals)
        return 1e18 * (_usd * (10 ** decimals)) / oneETHToUSD;
    } 
}