import { ethers } from "hardhat";
import { config } from "../src/config";

async function main() {
  const factory = config['polygon'].uniswapV2FactoryAddress;
  const uniswapV2router02 = config['polygon'].uniswapV2Router02Address;

  const ExampleDapp = await ethers.getContractFactory("ExampleDapp");
  const exampleDapp = await ExampleDapp.deploy(factory, uniswapV2router02);
  await exampleDapp.wait();

  console.log(`Example dapp address: ${exampleDapp.address}`);

    // * only verify on testnets or mainnets.
    if (process.env.ETHERSCAN_API_KEY) {
      await verify(exampleDapp.address, [factory, uniswapV2router02]);
  }
}

const verify = async (contractAddress, args) => {
  console.log("Verifying contract...");
  try {
      // setTimeout(await run("verify:verify", {
      //     address: contractAddress,
      //     constructorArguments: args,
      // }), 2000);
  } catch (e) {
      if (e.message.toLowerCase().includes("already verified")) {
          console.log("Already verified!");
      } else {
          console.log(e);
      }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
