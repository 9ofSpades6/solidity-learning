//만들 컨트랙트 이름과 보통 배포하는 파일 이름, 테스트 이름을 맞춤
//배포는 다를수도 있는데, 컨트랙트랑 테스트는 보통 맞춤, 컨트랙트마다 한 테스트파일이 생기도록

import hre from "hardhat";
import { expect } from "chai"
import { MyToken } from "../typechain-types";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";

const mintingAmount = 100n;
const decimals = 18n;

describe("My Token", () => {
    let myTokenC:MyToken;
    let signers: HardhatEthersSigner[]; //여러 테스트 월렛이 필요할 수 있으니까 
    beforeEach("should deploy", async ()=> {
        signers = await hre.ethers.getSigners();
        myTokenC = await hre.ethers.deployContract("MyToken", [
            "MyToken",
            "MT",
            decimals,
            100,
        ]);
    });
    describe("Basic state value check", () => {
    it("should return name", async () => {
        expect(await myTokenC.name()).equal("MyToken");
    });
    it("should return symbol", async () => {
         expect(await myTokenC.symbol()).equal("MT");
    });
    it("should return decimals", async () => {
        expect(await myTokenC.decimals()).equal(decimals);
    });
    it("should return 100 totalSupply", async ()=> {
        expect(await myTokenC.totalSupply()).equal(mintingAmount * 10n ** decimals);
        });    
    });

    describe("Mint", () => {
    it("should return 1MT balance for signer 0", async () => {
        const signer0 = signers[0];
        expect(await myTokenC.balanceOf(signer0)).equal(mintingAmount*10n**decimals);
        });
    });
    describe("Transfer", () => {
    it("should have 0.5MT", async () => {
        const signer0 = signers[0];
        const signer1 = signers[1];
        await expect(
            myTokenC.transfer(
            hre.ethers.parseUnits("0.5", decimals), 
            signer1.address
        )
    )
    .to.emit(myTokenC, "Transfer")
        .withArgs(
            signer0.address, 
            signer1.address, 
            hre.ethers.parseUnits("0.5", decimals)
        );
        expect(await myTokenC.balanceOf(signer1.address)).equal(
            hre.ethers.parseUnits("0.5", decimals)
        );  
    });
    it("should be reverted with insufficient balance error", async () => {
        const signer1 = signers[1];
        await expect(
        myTokenC.transfer(
            hre.ethers.parseUnits((mintingAmount +1n).toString(), decimals), 
            signer1.address
           )
        ).to.be.revertedWith("insufficient balance");
        });
    });
});
//로직에 대한 테스트를 잘 마련해놓으면 오류를 잡기 쉽다.
//종속성 있는건 끊어내기