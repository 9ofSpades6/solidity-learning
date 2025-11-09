// staking
// deposit(MyToken) / withdraw(MyToken) / 마이토큰을 예치하고 출금할 수 있는. 이런 서비스를 하는 스마트 컨트랙트를 만들 것임

// MyToken : token balance management
// - the balance of TinyBank address
// TinyBank : deposit / withdraw vault(금고)
// - users token management
// - user --> deposit --> TinyBank --> transfer(user --> TinyBank)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IMyToken {
    function transfer(uint256 amount, address to) external;

    function transferFrom(address from, address to, uint256 amount) external;
}

contract TinyBank {
    event Staked(address, uint256);

    IMyToken public stakingToken; //아까 배포했던 마이토큰의 주소가 와야함
    mapping(address => uint256) public staked;
    uint256 public totalStaked; //myToken의 totalsupply와 balanceof와 헷갈림. 이건 tinybank 서비스를 이용하는 사람들이 예치해놓은 토큰량의 합. totalsupply는 각자 가지고 있는거.

    constructor(IMyToken _stakingToken) {
        stakingToken = _stakingToken;
    }

    function stake(uint256 _amount) external {
        //IMyToken.transfer(msg.sender, address(this), _amount); //this는 현재 컨트랙트를 의미함. // 그리고 이 줄에는 문제가 있음. 이 함수를 호출하려면 토큰의 오너가 호출해야함.
        // 근데 이 함수는 TinyBank가 호출하고 있음. 컨트랙트가 다른 컨트랙트의 함수를 호출중임. 그래서 transfer 말고 transferfrom 사용.
        require(_amount >= 0, "cannot stake 0 amount");
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        staked[msg.sender] += _amount;
        totalStaked += _amount;
        emit Staked(msg.sender, _amount);
    }
}
