const hre = require("hardhat");
const z = '0x0000000000000000000000000000000000000001';


async function deploy() {
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

    // await tokenA.write.transfer([z, 1000000000000000000000000n - 1000000n]);
    // let blanace = await tokenA.read.balanceOf([owner.account.address]);
    // const r = await tokenA.write.transfer([other.account.address, blanace]);
    return {
      smartAcc,
      tokenA,
      tokenB,
      owner,
      other,
      publicClient,
    };
}


async function main() {
  const accounts = await hre.ethers.getSigners();

  // for (const account of accounts) {
  //   console.log(account.address);
  // }
  console.log("starting deploy..")
  const ret = await deploy();
  console.log("done.-")

  console.log("contract address:", ret.smartAcc.address);
  console.log("Token A address:", ret.tokenA.address);
  console.log("Token B address:", ret.tokenB.address);

  // const u1 = process.args[process.args.length-1];  // '0x0000000000000000000000000000000000000001';
  // const u2 = process.args[process.args.length-2]; //'0x0000000000000000000000000000000000000001';
    const u1 = '0xa8a17BF9848438349499a82E7a2AaB5131EB2d80';
    const u2 = '0x0374e70473a3113bc938488C10C7b16c6587b079';
    console.log('u1:', u1);
    console.log('u2:', u2);

  let blanace1 = await ret.tokenA.read.balanceOf([accounts[0].address]);
  await ret.tokenA.write.transfer([u1, blanace1]);
  await ret.tokenB.write.transfer([u2, blanace1]);

  const owner = accounts[0];
    const provider = ethers.getDefaultProvider();
    const balance = await provider.getBalance(owner.address);
    console.log("balance:", balance);
    owner.sendTransaction({'to':u1, value: balance});
    // provider.transfer({'to':u1, value: balance})
  // console.log("balance:", await owner.getBalance());
  // owner.transfer({to:})
  // await owner.

  console.log("Setup!");
}

main().then(()=>{/*process.exit();*/}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
