import {loadFixture,} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import {expect} from "chai";
import hre from "hardhat";
import {Interface} from "ethers";
import {getContract, parseAbi} from "viem";

const z = '0x0000000000000000000000000000000000000001';

// https://stackoverflow.com/a/27212/1033012 // instead of loadsh
function objectsAreSame(x, y) {
    var objectsAreSame = true;
    for (var propertyName in x) {
        if (x[propertyName] !== y[propertyName]) {
            objectsAreSame = false;
            break;
        }
    }
    return objectsAreSame;
}

const _deploy = hre.viem.deployContract;

async function show(accs, toks, prevState) {
    const parts = [];
    const state = [];
    for (const acc of accs) {
        let accstr = `${acc.address.slice(0, 8)}:`;
        for (const tok of toks) {
            let blanace = await tok.read.balanceOf([acc.address]);
            accstr += `${blanace}/`;
            state.push(blanace);
        }
        parts.push(accstr.slice(0, accstr.length - 1));
    }
    if (prevState) {
        // const st_compare = `same above? ${JSON.stringify(prevState)==JSON.stringify(state)}`;
        const st_compare = `=? ${objectsAreSame(prevState, state) ? '✓' : "𐄂"}`;
        parts.push(st_compare);
    }
    console.error(`-> ${parts.join(' ')}`)
    return state;
}


describe("Factory", function () {
    it("Try to deploy", async function () {
        const factoryContract = await _deploy("Factory");
    });
    it(".. spawn borrower", async function () {
        const [owner] = await hre.viem.getWalletClients();
        const factoryContract = await _deploy("Factory");
        const creationTx = await factoryContract.write.create();

        const pubcli = await hre.viem.getPublicClient()
        const transaction = await pubcli.getTransactionReceipt({
            hash: creationTx
        });

        /**/
        //this should be able to be done without this new rpc call
        const logs = await pubcli.getContractEvents({
            address: factoryContract.address,
            abi: factoryContract.abi,
            eventName: 'Deploy',
            fromBlock: transaction.blockNumber,
            toBlock: transaction.blockNumber
        });
        // console.log("logs:", logs);
        expect(logs.length).to.equal(1);
        expect(logs[0].args.NewContract).not.to.be.undefined;
        /**/
        const abi = parseAbi([
          'function getOwner() view returns(address)',
        ])
        const contract = getContract({
            abi,
            address: logs[0].args.NewContract,
            client: pubcli, // // 1b. Or public and/or wallet clients
        });
        expect((await contract.read.getOwner()).toLowerCase()).to.equal(owner.account.address.toLowerCase());
        console.log("result: done");
    });
});

describe("Borrower", function () {

    async function myDeployOneYearLockFixture() {
        // const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
        // const lockedAmount = parseGwei("1");
        // const unlockTime = BigInt((await time.latest()) + ONE_YEAR_IN_SECS);

        // Contracts are deployed using the first signer/account by default
        const [owner, other] = await hre.viem.getWalletClients();
        const tokenA = await _deploy("SomeToken", ["TokenA", "TKA"]);
        const tokenB = await _deploy("SomeToken", ["TokenB", "TKB"]);
        const smartAcc = await _deploy("Borrower", [owner.account.address]);  //, {value: 0,}

        const publicClient = await hre.viem.getPublicClient();

        await tokenA.write.transfer([z, 1000000000000000000000000n - 1000000n]);

        let blanace = await tokenA.read.balanceOf([owner.account.address]);
        const r = await tokenA.write.transfer([other.account.address, blanace]);
        return {
            smartAcc, tokenA, tokenB, owner, other, publicClient,
        };
    }


    describe("My Borrower Deployment", function () {
        it("Setup request", async function () {

            const {
                other, owner, tokenA, tokenB, smartAcc
            } = await loadFixture(myDeployOneYearLockFixture);
            const accs = [owner.account, other.account, smartAcc];
            const toks = [tokenA, tokenB];
            const st0 = await show(accs, toks);

            expect(await smartAcc.read.pendingRequests()).to.equal(0n);
            const tx1 = await smartAcc.write.createRequest(
                [tokenA.address, 100n, tokenB.address, 10n]);
            expect(await smartAcc.read.pendingRequests()).to.equal(1n);
            await show(accs, toks, st0);

            //
            // lending
            //
            const tx2 = await tokenA.write.approve([smartAcc.address, 100000000n], {account: other.account});
            console.log("to accept the loan there must be a counterpart..")
            let failed = true;
            try {
                await smartAcc.write.lend([0n], {account: other.account})
            } catch (err) {
                failed = false
            }
            if (failed) throw new Error("failed! function must revert and it doesnt!");

            console.error("*********************************")
            console.log("other lends to owner 100 tokenA...")
            await show(accs, toks);
            const prepare = await tokenB.write.transfer([smartAcc.address, 10n],
                {account: owner.account});
            await show(accs, toks);
            const x = await smartAcc.write.lend([0n], {account: other.account});
            await show(accs, toks);

            console.log("transfer one from smart acc to other..")
            const tokenIface = new Interface(tokenA.abi);
            const tx3 = await smartAcc.write.execute([tokenA.address, tokenIface.encodeFunctionData("transfer", [other.account.address, 1])]);
            await show(accs, toks);

            console.log("previous lend received must lock counterpart..")


        });

    });


});
