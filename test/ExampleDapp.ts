const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { chains } = require("./config.js");
const { erc20Abi } = require("./abis");
const DECIMALS_IN_USDC = 6;
const DECIMALS_IN_WETH = 18;
 
describe("ExampleDapp", function() {
  let exampleDapp;
  let uniswapV2Router02;
  let usdc;
  let weth;
  let owner;
  let user;
  let user2;
  let signerWithUSDC;
  let addressWithUSDC = "0x532242e63c34553b10f0e4fd7d8b5be22e4b9f55";

  beforeEach(async function() {
    [owner, user] = await ethers.getSigners();
    // Deploy ExampleDapp
    const ExampleDapp = await ethers.getContractFactory("ExampleDapp");
    exampleDapp = await ExampleDapp.deploy(chains[network.name].uniswapFactory, chains[network.name].uniswapV2Router02);
    // console.log("Signer with usdc balance before impersonating: ", await ethers.provider.getBalance(addressWithUSDC));
    // Impersonate signers and provide liquidity with that signer
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [addressWithUSDC]
    });
    signerWithUSDC = await ethers.getSigner(addressWithUSDC);
    // console.log("Address with usdc balance after impersonating: ", await ethers.provider.getBalance(addressWithUSDC));
    user2 = signerWithUSDC;

    // Deploy ERC20 tokens for testing
    usdc = new ethers.Contract(chains[network.name].usdcAddress, erc20Abi, ethers.provider);
    weth = new ethers.Contract(chains[network.name].wethAddress, erc20Abi, ethers.provider);
  });

  it("should return pair info", async function() {
    const [reserveA, reserveB, totalSupply] = await exampleDapp.pairInfo(usdc.address, weth.address);
    // console.log("ReserveA would be of usdc token: ", reserveA.toString());
    expect(reserveA).to.be.gt(0);
    expect(reserveB).to.be.gt(0);
    expect(totalSupply).to.be.gt(0);
  });

  it("should swap exact tokens for ETH", async function() {
    const amountIn = ethers.utils.parseUnits("100", DECIMALS_IN_USDC);
    const amountOutMin = 0; // TODO: Check if this should be zero? Ideally user would want a certain amount that can be factored as per 3% slippage
    await usdc.connect(user2).approve(exampleDapp.address, amountIn);
    const userTokenBalanceBefore = await usdc.balanceOf(user2.address);
    const userNativeBalanceBefore = await ethers.provider.getBalance(user2.address);
    await exampleDapp.connect(user2).swapExactTokensForETH(usdc.address, amountIn, amountOutMin);
    const userTokenBalanceAfter = await usdc.balanceOf(user2.address);
    const userNativeBalanceAfter = await ethers.provider.getBalance(user2.address);
    expect(userTokenBalanceAfter).to.equal(userTokenBalanceBefore.sub(amountIn));
    expect(userNativeBalanceAfter).to.be.gt(userNativeBalanceBefore);
  });

  it("should swap exact ETH for tokens", async function() {
    const amountIn = ethers.utils.parseEther(".01");
    const amountOutMin = 0; // TODO: Check if this should be zero? Ideally user would want a certain amount that can be factored as per 3% slippage
    const userTokenBalanceBefore = await usdc.balanceOf(user2.address);
    const userNativeBalanceBefore = await ethers.provider.getBalance(user2.address);
    await exampleDapp.connect(user2).swapExactETHForTokens(usdc.address, amountIn, amountOutMin, { value: amountIn });
    const userTokenBalanceAfter = await usdc.balanceOf(user2.address);
    const userNativeBalanceAfter = await ethers.provider.getBalance(user2.address);
    expect(userTokenBalanceAfter).to.be.gt(userTokenBalanceBefore.add(amountOutMin));
    expect(userNativeBalanceAfter).to.be.lt(userNativeBalanceBefore);
  });

  it("should swap exact tokens for tokens", async function() {
    const amountIn = ethers.utils.parseUnits("100", DECIMALS_IN_USDC);
    const amountOutMin = 0; // TODO: Check if this should be zero? Ideally user would want a certain amount that can be factored as per 3% slippage
    await usdc.connect(user2).approve(exampleDapp.address, amountIn);
    const userUSDCBalanceBefore = await usdc.balanceOf(user2.address);
    const userWETHBalanceBefore = await weth.balanceOf(user2.address);
    await exampleDapp.connect(user2).swapExactTokensForTokens(usdc.address, weth.address, amountIn, amountOutMin);
    const userUsdcBalanceAfter = await usdc.balanceOf(user2.address);
    const userWethBalanceAfter = await weth.balanceOf(user2.address);
    expect(userUSDCBalanceBefore).to.be.gt(userUsdcBalanceAfter);
    expect(userWETHBalanceBefore).to.be.lt(userWethBalanceAfter.add(amountOutMin));
  });

  it("should swap tokens for exact ETH", async function() {
    const amountInMax = ethers.utils.parseUnits("100", DECIMALS_IN_USDC);
    const amountOut = ethers.utils.parseEther(".01"); // TODO: Check if this should be zero? Ideally user would want a certain amount that can be factored as per 3% slippage
    await usdc.connect(user2).approve(exampleDapp.address, amountInMax);
    const userUSDCBalanceBefore = await usdc.balanceOf(user2.address);
    const userNativeBalanceBefore = await ethers.provider.getBalance(user2.address);
    await exampleDapp.connect(user2).swapTokensForExactETH(usdc.address, amountOut, amountInMax);
    const userUsdcBalanceAfter = await usdc.balanceOf(user2.address);
    const userNativeBalanceAfter = await ethers.provider.getBalance(user2.address);
    expect(userUSDCBalanceBefore).to.be.gt(userUsdcBalanceAfter);
    expect(userNativeBalanceBefore).to.be.lt(userNativeBalanceAfter);
  });

  it("should swap ETH for exact tokens", async function() {
    const amountOut = ethers.utils.parseUnits("100", DECIMALS_IN_USDC);
    const amountInMax = ethers.utils.parseEther("1"); // TODO: Check if this should be zero? Ideally user would want a certain amount that can be factored as per 3% slippage
    const userUSDCBalanceBefore = await usdc.balanceOf(user2.address);
    const userNativeBalanceBefore = await ethers.provider.getBalance(user2.address);
    await exampleDapp.connect(user2).swapETHForExactTokens(usdc.address, amountOut, amountInMax, { value: amountInMax });
    const userUsdcBalanceAfter = await usdc.balanceOf(user2.address);
    const userNativeBalanceAfter = await ethers.provider.getBalance(user2.address);
    expect(userUSDCBalanceBefore).to.be.lt(userUsdcBalanceAfter);
    expect(userNativeBalanceBefore).to.be.gt(userNativeBalanceAfter);
  });

  it("should swap tokens for exact tokens", async function() {
    const amountInMax = ethers.utils.parseUnits("1000", DECIMALS_IN_USDC);
    const amountOut = ethers.utils.parseEther(".1"); // TODO: Check if this should be zero? Ideally user would want a certain amount that can be factored as per 3% slippage
    await usdc.connect(user2).approve(exampleDapp.address, amountInMax);
    const userUSDCBalanceBefore = await usdc.balanceOf(user2.address);
    const userWETHBalanceBefore = await weth.balanceOf(user2.address);
    await exampleDapp.connect(user2).swapTokensForExactTokens(usdc.address, weth.address, amountInMax, amountOut);
    const userUsdcBalanceAfter = await usdc.balanceOf(user2.address);
    const userWethBalanceAfter = await weth.balanceOf(user2.address);
    expect(userUSDCBalanceBefore).to.be.gt(userUsdcBalanceAfter);
    expect(userWETHBalanceBefore.add(amountOut)).to.be.equal(userWethBalanceAfter);
  });

  it("should add liquidity", async function() {
    const amountOfTokenA = ethers.utils.parseUnits("1000", DECIMALS_IN_USDC);
    const amountOfTokenB = ethers.utils.parseEther("2");
    await usdc.connect(user2).approve(exampleDapp.address, amountOfTokenA);
    await weth.connect(user2).approve(exampleDapp.address, amountOfTokenB);
    const [reserveABefore, reserveBBefore, totalSupplyBefore] = await exampleDapp.pairInfo(usdc.address, weth.address);
    await exampleDapp.connect(user2).addLiquidity(usdc.address, weth.address, amountOfTokenA, amountOfTokenB);
    const [reserveAAfter, reserveBAfter, totalSupplyAfter] = await exampleDapp.pairInfo(usdc.address, weth.address);
    // Verify that liquidity has been added
    expect(totalSupplyAfter).to.be.gt(totalSupplyBefore);
    expect(reserveAAfter).to.be.gt(reserveABefore);
    expect(reserveBAfter).to.be.gt(reserveBBefore);
  });

  // it("should add liquidity with ETH", async function() {
  //   const amountOfTokenA = ethers.utils.parseUnits("1000", DECIMALS_IN_USDC);
  //   const amountOfTokenB = ethers.utils.parseEther("2");
  //   await usdc.connect(user2).approve(exampleDapp.address, amountOfTokenA);
  //   await weth.connect(user2).approve(exampleDapp.address, amountOfTokenB);
  //   const [reserveTokenBefore, reserveETHBefore, totalSupplyBefore] = await exampleDapp.pairInfo(usdc.address, chains[network.name].wethAddress);

  //   await exampleDapp.connect(user).addLiquidityETH(usdc.address, amountTokenDesired, { value: ethers.utils.parseEther("1") });

  //   const [reserveTokenAfter, reserveETHAfter, totalSupplyAfter] = await exampleDapp.pairInfo(usdc.address, chains[network.name].wethAddress);

  //   // Verify that liquidity has been added
  //   expect(totalSupplyAfter).to.be.gt(totalSupplyBefore);
  //   expect(reserveTokenAfter).to.be.gt(reserveTokenBefore);
  //   expect(reserveETHAfter).to.be.gt(reserveETHBefore);
  // });
});