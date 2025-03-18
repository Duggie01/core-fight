import { ethers } from "hardhat";

async function main() {
  const Game = await ethers.getContractFactory("MMOGame");
  const gameUpgradesContract = await Game.deploy();
  await gameUpgradesContract.waitForDeployment();
  console.log("Contract deployed at:", await gameUpgradesContract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
