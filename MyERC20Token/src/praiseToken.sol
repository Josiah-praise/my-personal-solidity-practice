// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract MyToken {
    string public name = "MyToken";
    string public symbol = "MTK";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balance;
    mapping(address => mapping(address => uint256)) public allowances;

    constructor(uint256 initial_supply) {
        totalSupply = initial_supply * (10**uint256(decimals));
        balance[msg.sender] = totalSupply;

        // on token creation, emit transfer from address 0
        emit Transfer(address(0), msg.sender, totalSupply);
    }

   

    event Transfer(address indexed from, address indexed to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    function approve(address _spender, uint256 _value)public returns(bool) {
        allowances[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transfer(address _to, uint256 _value)public returns(bool) {
        require(balance[msg.sender] >= _value, "Insufficient balance");

        balance[msg.sender] -= _value;
        balance[_to] += _value;
        emit Transfer(msg.sender, _to, _value);

        return true;  
    }


    function transferFrom(address _from, address _to, uint256 _value)public returns(bool success) {
        require(allowances[_from][msg.sender] >= _value, "Insufficient allowances");
        require(balance[_from] >= _value, "Owner has insufficient funds");

        balance[_from] -= _value;
        balance[_to] += _value;

        allowances[_from][msg.sender] -= _value; 

        emit Transfer(_from, _to, _value);
        return true;
    }
}