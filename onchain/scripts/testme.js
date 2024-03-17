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
    const factory = await _deploy("Factory", [], {value: 0,});
    //const smartAcc = await _deploy("Borrower", [0], {value: 0,});

    const publicClient = await hre.viem.getPublicClient();

    // await tokenA.write.transfer([z, 1000000000000000000000000n - 1000000n]);
    // let blanace = await tokenA.read.balanceOf([owner.account.address]);
    // const r = await tokenA.write.transfer([other.account.address, blanace]);
    return {
      factory,
      tokenA,
      tokenB,
      owner,
      other,
      publicClient,
    };
}


async function main() {
  const accounts = await hre.ethers.getSigners();
  const owner = accounts[2];
  console.log("owner:", owner.address)
    const provider = hre.ethers.provider;
    let balance = await provider.getBalance(owner.address);
    console.log("balance:", balance.toString(), await provider.getNetwork());
// console.log( await web3.eth.chainId());
// console.log( await web3.eth.getBlock());


  // for (const account of accounts) {
  //   console.log(account.address);
  // }
  console.log("starting deploy..")
  const ret = await deploy();
  console.log("done.-")

  console.log("contract address:", ret.factory.address);
  console.log("Token A address:", ret.tokenA.address);
  console.log("Token B address:", ret.tokenB.address);

  // const u1 = process.args[process.args.length-1];  
  // const u2 = process.args[process.args.length-2]; 
    const u1 = '0x75650F1EA4dB7aEA7eCf2E35Db377B5B60E7Ae2E'; // 0xa8a17BF9848438349499a82E7a2AaB5131EB2d80';
    const u2 = '0x0d161E6f7Fa9172C33bd03b8e8ca1cc39B3dCc3E'; // 0x0374e70473a3113bc938488C10C7b16c6587b079';
    console.log('u1:', u1);
    console.log('u2:', u2);

  let blanace1 = await ret.tokenA.read.balanceOf([accounts[0].address]);
  await ret.tokenA.write.transfer([u1, blanace1]);
  await ret.tokenB.write.transfer([u2, blanace1]);

    balance = await provider.getBalance(owner.address);
    console.log("balance:", balance);
    const value = balance*9n/10n;
    console.log("balance:", balance, 'value:', value);
    await owner.sendTransaction({'to':u1, value: value });
    // provider.transfer({'to':u1, value: balance})
  // console.log("balance:", await owner.getBalance());
  // owner.transfer({to:})
  // await owner.
    
	balance = await provider.getBalance(owner.address);
    console.log("balance:", balance.toString(), await provider.getNetwork());

  console.log("Setup!");
}

main().then(()=>{/*process.exit();*/}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
