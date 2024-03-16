import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
const { ethers } = require("hardhat");
import { getAddress, parseGwei } from "viem";
import {Interface} from "ethers";

const z = '0x0000000000000000000000000000000000000001';

// https://stackoverflow.com/a/27212/1033012 // instead of loadsh
function objectsAreSame(x, y) {
   var objectsAreSame = true;
   for(var propertyName in x) {
      if(x[propertyName] !== y[propertyName]) {
         objectsAreSame = false;
         break;
      }
   }
   return objectsAreSame;
}

async function show(accs, toks, prevState) {
  const parts = [];
  const state = [];
  for (const acc of accs) {
    let accstr = `${acc.address.slice(0,8)}:`;
    for (const tok of toks) {
      let blanace = await tok.read.balanceOf([acc.address]);
      accstr += `${blanace}/`;
      state.push(blanace);
    }
    parts.push(accstr.slice(0, accstr.length-1));
  }
  if (prevState) {
    // const st_compare = `same above? ${JSON.stringify(prevState)==JSON.stringify(state)}`;
    const st_compare = `=? ${objectsAreSame(prevState,state)?'✓':"𐄂"}`;
    parts.push(st_compare);
  }
  console.error(`-> ${parts.join(' ')}`)
  return state;
}




describe("Borrower", function () {

  async function myDeployOneYearLockFixture() {
    // const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    // const lockedAmount = parseGwei("1");
    // const unlockTime = BigInt((await time.latest()) + ONE_YEAR_IN_SECS);

    // Contracts are deployed using the first signer/account by default
    const [owner, other] = await hre.viem.getWalletClients();
    const _deploy = hre.viem.deployContract;
    const tokenA = await _deploy("SomeToken", ["TokenA", "TKA"]);
    const tokenB = await _deploy("SomeToken", ["TokenB", "TKB"]);
    const smartAcc = await _deploy("Borrower", [0], {value: 0,});

    const publicClient = await hre.viem.getPublicClient();

    await tokenA.write.transfer([z, 1000000000000000000000000n - 1000000n]);

    let blanace = await tokenA.read.balanceOf([owner.account.address]);
    const r = await tokenA.write.transfer([other.account.address, blanace]);
    return {
      smartAcc,
      tokenA,
      tokenB,
      owner,
      other,
      publicClient,
    };
  }



  describe("My Borrower Deployment", function () {
    it("Setup request", async function () {

      const { other, owner, tokenA,
        tokenB, smartAcc } = await loadFixture(myDeployOneYearLockFixture);
      const accs = [owner.account, other.account, smartAcc];
      const toks =[tokenA, tokenB];
      const st0 = await show(accs, toks);

      expect(await smartAcc.read.pendingRequests()).to.equal(0n);
      const tx1 = await smartAcc.write.createRequest([tokenA.address, 100n, tokenB.address, 10n]);
      expect(await smartAcc.read.pendingRequests()).to.equal(1n);
      await show(accs, toks, st0);

      //
      // lending
      //
      const tx2 = await tokenA.write.approve([smartAcc.address, 100000000n], {account: other.account});
      console.log("to accept the loan there must be a counterpart..")
      expect(async ()=> await smartAcc.write.lend([0n], {account: other.account}))
          .to.rejected();


      console.log("other lends to owner 100 tokenA...")
      const x = await smartAcc.write.lend([0n], {account: other.account});
      await show(accs, toks);

      console.log("transfer one from smart acc to other..")
      const tokenIface = new Interface(tokenA.abi);
      const tx3 = await smartAcc.write.execute([tokenA.address,
            tokenIface.encodeFunctionData("transfer", [
                other.account.address, 1
            ])]);
      await show(accs, toks);

      console.log("previous lend received must lock counterpart..")


    });

  });


});
