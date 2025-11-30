// 배포를 하기 위해서 배포 스크립트를 짜줘야함. 
//우선, 컨트랙트를 빌드해서 네트워크에 전송할 준비를 도와주는 빌드모듈을 적어줘야함.
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyTokenDeploy", (m) => {
  const myTokenC = m.contract("MyToken", ["MyToken", "MT", 18, 100]);
  const tinyBankC = m.contract("TinyBank", [myTokenC]);
  m.call(myTokenC, "setManager", [tinyBankC]);
  return { myTokenC, tinyBankC };
});


// 근데 이거 블록체인 네트워크 안띄웠는데 어디에 배포한거임? 배포하면서 일시적으로 하드햇 네트워크 띄우고 배포하고 또 하드햇 네트워크 종료한거임.
// 그럼 하드헷 네트워크 다시 띄우면 배포된 컨트랙트가 없을거임. 

//그래서 확인해보려고 npx hardhat node로 띄우고 새 터미널에서 다시 배포하면 컨트랙트가 어떻게 배포되었는지 볼 수 있었음.