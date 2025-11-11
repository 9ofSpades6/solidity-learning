import hre from "hardhat";
import {expect} from "chai";
import { DECIMALS, MINTING_AMOUNT } from "./constant";
import { MyToken, TinyBank } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("TinyBank", () => {
    let signers: HardhatEthersSigner[];
    let myTokenC: MyToken;
    let tinyBankC: TinyBank;
    let owner: HardhatEthersSigner;
    let managers: HardhatEthersSigner[];
    let nonManager: HardhatEthersSigner;

    beforeEach(async () => {
        signers = await hre.ethers.getSigners();
        owner = signers[0];
        managers = [signers[1], signers[2], signers[3], signers[4], signers[5]];
        nonManager = signers[6];
         myTokenC = await hre.ethers.deployContract("MyToken", [
            "MyToken",
            "MT",
            DECIMALS,
            MINTING_AMOUNT,
        ]);

        const managerAddresses = managers.map(m => m.address);

        tinyBankC = await hre.ethers.deployContract("TinyBank", [
            managerAddresses,
            5,
            await myTokenC.getAddress()
        ]);
        await myTokenC.setManager(tinyBankC.getAddress());
    });

          describe("Initialized state check", ()=> {
        it("should return totalStaked 0", async () => {
            expect(await tinyBankC.totalStaked()).equal(0);
        });
        it("should return staked 0 amount of signer0", async () => {
            const signer0 = signers[0]; 
            expect(await tinyBankC.staked(signer0.address)).equal(0);
        });    
    });

    describe("Staking", async () => {
        it("should return staked amount", async () => {
            const signer0 = signers[0];
            const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
            await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
            await tinyBankC.stake(stakingAmount);
            expect(await tinyBankC.staked(signer0.address)).equal(stakingAmount);
            expect(await tinyBankC.totalStaked()).equal(stakingAmount);
            expect(await myTokenC.balanceOf(tinyBankC)).equal(
                await tinyBankC.totalStaked()
             );
        });
    });

        describe("Withdraw", () => {
            it("should return 0 staked after withdrawing total token", async () => {
            const signer0 = signers[0];
            const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
            await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
            await tinyBankC.stake(stakingAmount);
            await tinyBankC.withdraw(stakingAmount);
            expect(await tinyBankC.staked(signer0.address)).equal(0);
            });
        });

        describe("reward", () => {
            it("should reward 1MT every blocks" , async () => {
                const signer0 = signers[0];
                const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
                await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
                await tinyBankC.stake(stakingAmount);

                const BLOCKS = 5n;
                const transferAmount = hre.ethers.parseUnits("1", DECIMALS);
                for(var i=0; i< BLOCKS; i++) {
                     await myTokenC.transfer(transferAmount, signer0.address);
                }
                

                await tinyBankC.withdraw(stakingAmount);
                expect(await myTokenC.balanceOf(signer0.address)).equal(
                    hre.ethers.parseUnits((BLOCKS + MINTING_AMOUNT + 1n).toString()) 
                );
            });
        });

        describe("Multi Manager Access Control", () => {
            describe("Confirm function", () => {
                it("should allow managers to confirm", async () => {
                    await tinyBankC.connect(managers[0]).confirm();
                    expect(await tinyBankC.confirmed(0)).equal(true);
                });

                it("should revert when non-manager tries to confirm", async () => {
                    await expect(
                        tinyBankC.connect(nonManager).confirm()
                    ).to.be.revertedWith("You are not a manager");
                });

                it("should allow all managers to confirm", async () => {
                for (let i = 0; i < 5; i++) {
                    await tinyBankC.connect(managers[i]).confirm();
                    expect(await tinyBankC.confirmed(i)).equal(true);
                }
            });
         });

         describe("setRewardPerBlock with MultiManagedAccess", () => {
            it("should revert when not all managers have confirmed", async () => {
                const newReward = hre.ethers.parseUnits("10", DECIMALS);
                
                await tinyBankC.connect(managers[0]).confirm();
                await tinyBankC.connect(managers[1]).confirm();
                await tinyBankC.connect(managers[2]).confirm();
                
                await expect(
                    tinyBankC.connect(managers[0]).setRewardPerBlock(newReward)
                ).to.be.revertedWith("Not all confirmed yet");
            });
         });
        });
    });
