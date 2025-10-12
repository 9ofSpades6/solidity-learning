// Token : smart contract based <- 그 네트워크 위에서 개발한
// 스마트 컨트랙트들의 기반한 토큰을 발행한다 != 네이티브 토큰을 발행한다
//인데 네이티브 토큰과 같이 비슷하게 움직일 수 있는 토큰 기능을 스마트 컨트랙트로 구현하는 것
// BTC, ETH, XRP, KAIA : native token 그 네트워크 안에서는 이 토큰만 사용

// 가장먼저 라이센스 정책을 입력해줘야함
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28; // 컴파일러에게 소스 코드를 어떻게 처리해야하는지 지시하는 명령문

// class 대신 contract
contract MyToken {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed spender, uint256 amount);
    string public name;
    string public symbol;
    uint8 public decimals; // 1ETH --> 1*10^18 wei, 1 wei --> 1*10^(-18)

    // uint8 --> 8bit unsigned int ...., uint256 (32byte)
    uint256 public totalSupply; //총 발행량
    mapping(address => uint256) public balanceOf; // 누가 얼마를 가지고 있느냐
    // 데이터를 조회하는 것은 tx로 처리되지 않음. 그냥 api call로 리턴해줌
    mapping(address => mapping(address => uint256)) allowance;

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimal,
        uint256 _amount
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimal;
        _mint(_amount * 10 ** uint256(decimals), msg.sender); // 이 컨트랙트를 배포하는 사람한테 이만큼의 어마운트를 발행하는 것, 1MT
    } // solidity에서 변수는 기본적으로 uint256 타입이다, 기본적으로 모든 값을 32바이트로 처리해서

    //transaction
    //from, to, data, value, gas,...
    // 생성자를 불러올때만 배포되니까 totalSupply는 영원히 1이겠징 추가발행을 금지하려면 이렇게...

    function approve(address spender, uint amount) external {
        allowance[msg.sender][spender] = amount;
        emit Approval(spender, amount);
    }

    function transferFrom(address from, address to, uint256 amount) external {
        address spender = msg.sender;
        require(allowance[from][spender] >= amount, "insufficient allowance");
        allowance[from][spender] -= amount;
        balanceOf[from] -= amount; // 이부분이 취약
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _mint(uint256 amount, address owner) internal {
        totalSupply += amount; //누군가에게 발행한 토큰을 안넣어주면 토큰이 증발함
        balanceOf[owner] += amount;
        // totalSupply = totalSupply + amount;
        // balanceOf[owner] = balanceOf[owner] + amount;
        emit Transfer(address(0), owner, amount);
    }

    // function totalSupply() external view returns (uint256) {
    //     return totalSupply;
    // } // contract안에 있는 public state(field)는 디폴트로 getter함수가 만들어짐
    // function balanceOf(address owner) external view returns (uint256) {
    //     return balanceOf[owner]; //타입스크립트랑 비슷하게 오브젝트의 키를 이렇게 접근함
    // } //이미 퍼블릭 타입이기 때문에 정의가 되어있음
    // function name() external view returns (string memory) {
    // return name; // 스트링 타입은 길이가 정해져 있지 않아서 메모리를 사용해서 반환하라 해줘야함
    // }

    function transfer(uint256 amount, address to) external {
        require(balanceOf[msg.sender] >= amount, "insufficient balance");
        balanceOf[msg.sender] -= amount; //가지고 있는 토큰보다 더 많은 양을 보내게 되면?? 오버플로 발생! uint라서 음수가 만들어질 수 없는데 음수를 만들려한 거임
        balanceOf[to] += amount;

        emit Transfer(msg.sender, to, amount);
    }
}
