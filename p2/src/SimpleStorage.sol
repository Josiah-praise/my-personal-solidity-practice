// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract SimpleStorage{
    uint256 public num;

    function setNum(uint256 _num)public {
        num = _num;
    }
}

contract SimpleStorageFactory{
    SimpleStorage private simpleStore;

    constructor() {
        simpleStore = new SimpleStorage();
    }

    function sfGet()public view returns(uint256){
        return simpleStore.num();
    }

    function sfSet(uint256 _num)public {
        simpleStore.setNum(_num);
    }
}
