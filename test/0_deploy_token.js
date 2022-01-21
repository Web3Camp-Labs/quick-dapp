const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenErc20", function () {
  it("Test TokenErc20", async function () {
    const TokenContract = await ethers.getContractFactory("TokenERC20");
    const token = await TokenContract.deploy("Wendy's First Token", "WFT");
    await token.deployed();
    console.log("addressValue=====", token.address);


    const USDTTokenContract = await ethers.getContractFactory("TokenERC20");
    const USDTtoken = await USDTTokenContract.deploy("USDT Token", "USDT");
    await USDTtoken.deployed();
    console.log("USDT addressValue=====", USDTtoken.address);
  });
});
