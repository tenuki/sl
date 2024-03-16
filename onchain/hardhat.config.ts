import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-ethers";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  defaultNetwork: "hardhat"
};


import { task } from "hardhat/config";
// import {main} from "./tasks/testme";

// task("sample", "A sample task with params")
//   .addPositionalParam("param1")
//   .addPositionalParam("param2")
//   .setAction(async (taskArgs) => {
//     main()
//     console.log(taskArgs);
//   });


export default config;
