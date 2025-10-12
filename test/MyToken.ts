//만들 컨트랙트 이름과 보통 배포하는 파일 이름, 테스트 이름을 맞춤
//배포는 다를수도 있는데, 컨트랙트랑 테스트는 보통 맞춤, 컨트랙트마다 한 테스트파일이 생기도록

import hre from "hardhat";
import { expect } from "chai"
import { MyToken } from "../typechain-types";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";

describe("mytoken deploy", () => {
    let myTokenC:MyToken;
    let signers: HardhatEthersSigner[]; //여러 테스트 월렛이 필요할 수 있으니까 
    before("should deploy", async ()=> {
        signers = await hre.ethers.getSigners();
        myTokenC = await hre.ethers.deployContract("MyToken", [
            "MyToken",
            "MT",
            18,
        ]);
        expect(await myTokenC.name()).equal("MyToken");
        expect(await myTokenC.symbol()).equal("MT");
        expect(await myTokenC.decimals()).equal("18");
    });
    it("should return name", async () => {
        expect(await myTokenC.name()).equal("MyToken");
    });
    it("should return symbol", async () => {
         expect(await myTokenC.symbol()).equal("MT");
    });
    it("should return decimals", async () => {
        expect(await myTokenC.decimals()).equal("18");
    });
    it("should return 0 totalSupply", async ()=> {
        expect(await myTokenC.totalSupply()).equal(1n*10n**18n);
    })    
    it("should return 1MT balance for signer 0", async () => {
        const signer0 = signers[0];
        expect(await myTokenC.balanceOf(signer0)).equal(1n*10n**18n);
    });
});

//로직에 대한 테스트를 잘 마련해놓으면 오류를 잡기 쉽다.