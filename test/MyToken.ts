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
    describe("TransferFrom", () => {
         it("should allow signer1 to transfer signer0's tokens to signer1", async () => {
            const signer0 = signers[0];
            const signer1 = signers[1];
            const transferAmount = hre.ethers.parseUnits("10", decimals);
            
            const signer0InitialBalance = await myTokenC.balanceOf(signer0.address);
            const signer1InitialBalance = await myTokenC.balanceOf(signer1.address);
            
            // 1. approve: signer0이 signer1에게 토큰 이동 권한 부여
            await expect(myTokenC.approve(signer1.address, transferAmount))
                .to.emit(myTokenC, "Approval")
                .withArgs(signer1.address, transferAmount); 
            
            // allowance 확인
            expect(await myTokenC.allowance(signer0.address, signer1.address))
                .equal(transferAmount);
            
            // 2. transferFrom: signer1이 signer0의 토큰을 자신(signer1)에게 전송
            await expect(
                myTokenC
                    .connect(signer1)
                    .transferFrom(
                        signer0.address,
                        signer1.address,
                        transferAmount
                    )
            )
            .to.emit(myTokenC, "Transfer")
            .withArgs(signer0.address, signer1.address, transferAmount);
            
            // 3. balance 확인
            // signer0의 잔액은 감소
            expect(await myTokenC.balanceOf(signer0.address))
                .equal(signer0InitialBalance - transferAmount);
            
            // signer1의 잔액은 증가
            expect(await myTokenC.balanceOf(signer1.address))
                .equal(signer1InitialBalance + transferAmount);
            
            // allowance는 사용된 만큼 감소 
            expect(await myTokenC.allowance(signer0.address, signer1.address))
                .equal(0n);
        });
        it("should emit Approval event", async () => {
            const signer1 = signers[1];
            await expect(myTokenC.approve(signer1.address, hre.ethers.parseUnits("10", decimals)))
            .to.emit(myTokenC, "Approval")
            .withArgs(signer1.address, hre.ethers.parseUnits("10", decimals));
        });
        it("should be reverted with insufficient allowance error", async () => {
            const signer0 = signers[0];
            const signer1 = signers[1];
            await expect (myTokenC
            .connect(signer1)
            .transferFrom(
                signer0.address,
                signer1.address, 
                hre.ethers.parseUnits("1", decimals)
            )
        ).to.be.revertedWith("insufficient allowance");
        });
    });
});
