import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("MMOGame", function () {
  async function deployMMOGame() {
    const [account1, account2, account3, account4] = await hre.ethers.getSigners();

    // Deploy MMOGame contract
    const MMOGame = await hre.ethers.getContractFactory("MMOGame");
    const gameContract = await MMOGame.deploy();
    await gameContract.waitForDeployment();

    return { gameContract, account1, account2, account3, account4 };
  }

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { gameContract, account1 } = await loadFixture(deployMMOGame);
      expect(await gameContract.owner()).to.equal(account1.address);
    });
  });

//   describe("World Creation", function () {
//     it("Should allow only the owner to create a world", async function () {
//       const { gameContract, account1, account2 } = await loadFixture(deployMMOGame);
  
//       // ✅ Correct way to get and log balance
//       const balance1 = await ethers.provider.getBalance(account1.address);
//       console.log("Account1 Balance:", ethers.formatEther(balance1), "ETH");
  
//       // ✅ Expect the owner (account1) to successfully create a world
//       const fee = ethers.parseEther("0.1");
//       await expect(gameContract.connect(account1).createWorld(10, 10, fee))
//         .to.emit(gameContract, "WorldCreated");
  
//       // ✅ Expect a non-owner (account2) to fail
//     //   await expect(gameContract.connect(account2).createWorld(10, 10, fee))
//     //     .to.be.rejectedWith("Only owner can call this.");
//     });
//   });

  describe("Joining World", function () {
    it("Should allow players to join the world", async function () {
      const { gameContract, account1, account2, account3 } = await loadFixture(deployMMOGame);

      // Account 1 creates a world
      const firstWorld = await gameContract.connect(account1).createWorld(10, 10, 1);
      console.log(firstWorld, "fish");

      // Account 2 and 3 join the world
      await expect(gameContract.connect(account2).joinWorld(0, { value: ethers.parseEther("0.1") }))
        .to.emit(gameContract, "PlayerJoined");

      await expect(gameContract.connect(account3).joinWorld(1, { value: ethers.parseEther("0.1") }))
        .to.emit(gameContract, "PlayerJoined");
    });

    it("Should prevent joining a world without paying the fee", async function () {
      const { gameContract, account1, account2 } = await loadFixture(deployMMOGame);

      await gameContract.connect(account1).createWorld(10, 10, ethers.parseEther("0.1"));

      await expect(gameContract.connect(account2).joinWorld(1, { value: ethers.parseEther("0.05") }))
        .to.be.rejectedWith("Insufficient fee.");
    });

    it("Should prevent duplicate world joins", async function () {
      const { gameContract, account1, account2 } = await loadFixture(deployMMOGame);

      await gameContract.connect(account1).createWorld(10, 10, ethers.parseEther("0.1"));

      await gameContract.connect(account2).joinWorld(1, { value: ethers.parseEther("0.1") });

      await expect(gameContract.connect(account2).joinWorld(1, { value: ethers.parseEther("0.1") }))
        .to.be.rejectedWith("Already joined this world.");
    });
  });

//   describe("Attacking", function () {
//     it("Should prevent a player from attacking if they haven't joined the world", async function () {
//       const { gameContract, account1, account2, account3, account4 } = await loadFixture(deployMMOGame);

//       await gameContract.connect(account1).createWorld(10, 10, ethers.parseEther("0.1"));

//       await gameContract.connect(account2).joinWorld(1, { value: ethers.parseEther("0.1") });
//       await gameContract.connect(account3).joinWorld(1, { value: ethers.parseEther("0.1") });

//       await expect(gameContract.connect(account4).attackCity(1, account2.address))
//         .to.be.rejectedWith("City does not exist.");
//     });

//     it("Should allow a valid attack", async function () {
//       const { gameContract, account1, account2, account3 } = await loadFixture(deployMMOGame);

//       await gameContract.connect(account1).createWorld(10, 10, ethers.parseEther("0.1"));

//       await gameContract.connect(account2).joinWorld(1, { value: ethers.parseEther("0.1") });
//       await gameContract.connect(account3).joinWorld(1, { value: ethers.parseEther("0.1") });

//       await expect(gameContract.connect(account2).attackCity(1, account3.address))
//         .to.emit(gameContract, "CityAttacked");
//     });

//     it("Should allow a late joiner to attack", async function () {
//       const { gameContract, account1, account2, account3, account4 } = await loadFixture(deployMMOGame);

//       await gameContract.connect(account1).createWorld(10, 10, ethers.parseEther("0.1"));

//       await gameContract.connect(account2).joinWorld(1, { value: ethers.parseEther("0.1") });
//       await gameContract.connect(account3).joinWorld(1, { value: ethers.parseEther("0.1") });

//       await expect(gameContract.connect(account4).attackCity(1, account2.address))
//         .to.be.rejectedWith("City does not exist.");

//       await gameContract.connect(account4).joinWorld(1, { value: ethers.parseEther("0.1") });

//       await expect(gameContract.connect(account4).attackCity(1, account2.address))
//         .to.emit(gameContract, "CityAttacked");
//     });
//   });
});
