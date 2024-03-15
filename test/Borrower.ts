import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
const { ethers } = require("hardhat");

import { getAddress, parseGwei } from "viem";


describe("Borrower", function () {

  async function myDeployOneYearLockFixture() {
    // const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    // const lockedAmount = parseGwei("1");
    // const unlockTime = BigInt((await time.latest()) + ONE_YEAR_IN_SECS);

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    // const tokenA = await hre.viem.deployContract("SomeToken", ["TokenA", "TKA"]);
    // const tokenB = await hre.viem.deployContract("SomeToken", [ "TokenB", "TKB"]);
    const _deploy = hre.viem.deployContract;
    const tokenA = await _deploy("SomeToken", ["TokenA", "TKA"]);
    const tokenB = await _deploy("SomeToken", ["TokenB", "TKB"]);

    const smartAcc = await _deploy("Borrower", [0], {value: 0,});
    console.error(smartAcc);

    const publicClient = await hre.viem.getPublicClient();
    let blanace = await tokenA.read.balanceOf([owner.account.address]);
    console.log('balance:', blanace);
    const r = await tokenA.write.transfer([otherAccount.account.address, blanace]);
    console.error(r);

    return {
      smartAcc,
      tokenA,
      tokenB,
      owner,
      otherAccount,
      publicClient,
    };
  }



  describe("My Borrower Deployment", function () {
    it("Setup", async function () {
      const { otherAccount, owner, tokenA,
        tokenB, smartAcc } = await loadFixture(myDeployOneYearLockFixture);
      // console.error(tokenA)

      const tx1 = await smartAcc.write.createRequest([tokenA.address, 100n, tokenB.address, 10n]);
      console.log('pedidos:', await smartAcc.read.pendingRequests());


    let blanace = await tokenA.read.balanceOf([otherAccount.account.address]);
    console.log('tokenAbalance of other account:', blanace);
      const tx2 = await tokenA.write.approve([smartAcc.address, 100000000n], {account: otherAccount.account});
    console.log('tx2:', tx2);
    console.log( 'owner:', owner.account.address);
    console.log( 'otherwallet:', otherAccount.account.address);

      const x = await smartAcc.write.lend([0n], {account: otherAccount.account});

      // expect(await lock.read.unlockTime()).to.equal(unlockTime);
    });

  });


});
