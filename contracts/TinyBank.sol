// staking
// deposit(MyToken) / withdraw(MyToken) / 마이토큰을 예치하고 출금할 수 있는. 이런 서비스를 하는 스마트 컨트랙트를 만들 것임

// MyToken : token balance management
// - the balance of TinyBank address
// TinyBank : deposit / withdraw vault(금고)
// - users token management
// - user --> deposit --> TinyBank --> transfer(user --> TinyBank)

// Reward
// - reawrd token : Mytoken
// -reward resources : 1MT/block minting
// - reward strategy : staked [user]/totalStaked distribution

// -signer0 block 0 staking
//-signer1 block 5 staking
// - 0-- 1-- 2-- 3-- 4-- 5--
//   |                   |
// signer0 10MT          signer1 10MT

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IMyToken {
    function transfer(uint256 amount, address to) external;

    function transferFrom(address from, address to, uint256 amount) external;

    function mint(uint256 amount, address owner) external;
}

contract TinyBank {
    event Staked(address, uint256);
    event Withdraw(uint256 amount, address to);

    IMyToken public stakingToken; //아까 배포했던 마이토큰의 주소가 와야함

    mapping(address => uint256) public lastClaimedBlock;
    uint256 rewardPerBlock = 1 * 10 ** 18;

    mapping(address => uint256) public staked;
    uint256 public totalStaked; //myToken의 totalsupply와 balanceof와 헷갈림. 이건 tinybank 서비스를 이용하는 사람들이 예치해놓은 토큰량의 합. totalsupply는 각자 가지고 있는거.

    constructor(IMyToken _stakingToken) {
        stakingToken = _stakingToken;
    }

    // who? when?
    function distributeReward(address to) internal {
        uint256 blocks = block.number - lastClaimedBlock[to];
        uint256 reward = (blocks * rewardPerBlock * staked[to]) / totalStaked;
        stakingToken.mint(reward, to);
        lastClaimedBlock[to] = block.number;
    }

    function stake(uint256 _amount) external {
        //IMyToken.transfer(msg.sender, address(this), _amount); //this는 현재 컨트랙트를 의미함. // 그리고 이 줄에는 문제가 있음. 이 함수를 호출하려면 토큰의 오너가 호출해야함.
        // 근데 이 함수는 TinyBank가 호출하고 있음. 컨트랙트가 다른 컨트랙트의 함수를 호출중임. 그래서 transfer 말고 transferfrom 사용.
        require(_amount >= 0, "cannot stake 0 amount");
        distributeReward(msg.sender);
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        staked[msg.sender] += _amount;
        totalStaked += _amount;
        emit Staked(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external {
        require(staked[msg.sender] >= _amount, "insufficient staked token");
        distributeReward(msg.sender);
        stakingToken.transfer(_amount, msg.sender);
        staked[msg.sender] -= _amount;
        totalStaked -= _amount;
        emit Withdraw(_amount, msg.sender);
    }
}
