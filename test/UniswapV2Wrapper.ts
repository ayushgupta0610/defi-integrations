const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { chains } = require("./config.js");
const { erc20Abi } = require("./abis");
const DECIMALS_IN_USDC = 6;
const DECIMALS_IN_WETH = 18;

describe("UniswapV2Wrapper", function () {
  let uniswapV2Wrapper;
  let uniswapV2Router02;
  let uniswapV2Factory;
  let usdc;
  let weth;
  let owner;
  let user;
  let user2;
  let signerWithUSDC;
  let priceOfWETH;
  let wethUsdcPairAddress;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    console.log("wethAddress: ", chains[network.name].wethAddress);
    console.log("usdcAddress: ", chains[network.name].usdcAddress);
    // Deploy UniswapV2Wrapper
    const UniswapV2Wrapper = await ethers.getContractFactory(
      "UniswapV2Wrapper"
    );
    uniswapV2Router02 = await ethers.getContractAt(
      "IUniswapV2Router02",
      chains[network.name].uniswapV2Router02
    );
    uniswapV2Factory = await ethers.getContractAt(
      "IUniswapV2Factory",
      chains[network.name].uniswapV2Factory
    );
    console.log("uniswapV2Factory: ", uniswapV2Factory);
    wethUsdcPairAddress = await uniswapV2Factory.getPair(
      chains[network.name].wethAddress,
      chains[network.name].usdcAddress
    );
    console.log("WETH USDC Pair Address: ", wethUsdcPairAddress);
    const uniswapV2Pair = await ethers.getContractAt(
      "IUniswapV2Pair",
      wethUsdcPairAddress
    );
    uniswapV2Wrapper = await UniswapV2Wrapper.deploy(
      chains[network.name].uniswapV2Factory,
      chains[network.name].uniswapV2Router02
    );
    // console.log("Signer with usdc balance before impersonating: ", await ethers.provider.getBalance(chains[network.name].addressWithUSDC));
    // Impersonate signers and provide liquidity with that signer
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [chains[network.name].addressWithUSDC],
    });
    signerWithUSDC = await ethers.getSigner(
      chains[network.name].addressWithUSDC
    );
    // console.log("Address with usdc balance after impersonating: ", await ethers.provider.getBalance(chains[network.name].addressWithUSDC));
    user2 = signerWithUSDC;

    // Create instance of USDC and WETH for testing
    usdc = new ethers.Contract(
      chains[network.name].usdcAddress,
      erc20Abi,
      ethers.provider
    );
    weth = new ethers.Contract(
      chains[network.name].wethAddress,
      erc20Abi,
      ethers.provider
    );
    // getReserves of the token pair to get the pricing of the same
    const reserves = uniswapV2Pair.getReserves();
    console.log("USDC and WETH reserves: ", reserves);
  });

  it("should return price of 1 WETH", async function () {
    // When you swap 1 WETH for USDC what's the price you get in return would define price of WETH
    priceOfWETH = uniswapV2Router02.getReserves()
    //   10 ** 18,
    //   chains[network.name].wethAddress,
    //   chains[network.name].usdcAddress
    // );
    console.log("WETH price in USDC: ", priceOfWETH);
  });

  it("should swap exact tokens for ETH", async function () {
    const amountIn = ethers.utils.parseUnits("100", DECIMALS_IN_USDC);
    const amountOutMin = 0; // TODO: Check if this should be zero? Ideally user would want a certain amount that can be factored as per 3% slippage
    await usdc.connect(user2).approve(uniswapV2Wrapper.address, amountIn);
    const userTokenBalanceBefore = await usdc.balanceOf(user2.address);
    const userNativeBalanceBefore = await ethers.provider.getBalance(
      user2.address
    );
    await uniswapV2Wrapper
      .connect(user2)
      .swapExactTokensForETH(usdc.address, amountIn, amountOutMin);
    const userTokenBalanceAfter = await usdc.balanceOf(user2.address);
    const userNativeBalanceAfter = await ethers.provider.getBalance(
      user2.address
    );
    expect(userTokenBalanceAfter).to.equal(
      userTokenBalanceBefore.sub(amountIn)
    );
    expect(userNativeBalanceAfter).to.be.gt(userNativeBalanceBefore);
  });

  it("should swap exact ETH for tokens", async function () {
    const amountIn = ethers.utils.parseEther(".01");
    const amountOutMin = 0; // TODO: Check if this should be zero? Ideally user would want a certain amount that can be factored as per 3% slippage
    const userTokenBalanceBefore = await usdc.balanceOf(user2.address);
    const userNativeBalanceBefore = await ethers.provider.getBalance(
      user2.address
    );
    await uniswapV2Wrapper
      .connect(user2)
      .swapExactETHForTokens(usdc.address, amountIn, amountOutMin, {
        value: amountIn,
      });
    const userTokenBalanceAfter = await usdc.balanceOf(user2.address);
    const userNativeBalanceAfter = await ethers.provider.getBalance(
      user2.address
    );
    expect(userTokenBalanceAfter).to.be.gt(
      userTokenBalanceBefore.add(amountOutMin)
    );
    expect(userNativeBalanceAfter).to.be.lt(userNativeBalanceBefore);
  });

  it("should swap exact tokens for tokens", async function () {
    const amountIn = ethers.utils.parseUnits("100", DECIMALS_IN_USDC);
    const amountOutMin = 0; // TODO: Check if this should be zero? Ideally user would want a certain amount that can be factored as per 3% slippage
    await usdc.connect(user2).approve(uniswapV2Wrapper.address, amountIn);
    const userUSDCBalanceBefore = await usdc.balanceOf(user2.address);
    const userWETHBalanceBefore = await weth.balanceOf(user2.address);
    await uniswapV2Wrapper
      .connect(user2)
      .swapExactTokensForTokens(
        usdc.address,
        weth.address,
        amountIn,
        amountOutMin
      );
    const userUsdcBalanceAfter = await usdc.balanceOf(user2.address);
    const userWethBalanceAfter = await weth.balanceOf(user2.address);
    expect(userUSDCBalanceBefore).to.be.gt(userUsdcBalanceAfter);
    expect(userWETHBalanceBefore).to.be.lt(
      userWethBalanceAfter.add(amountOutMin)
    );
  });

  it("should swap tokens for exact ETH", async function () {
    const amountInMax = ethers.utils.parseUnits("100", DECIMALS_IN_USDC);
    const amountOut = ethers.utils.parseEther(".01"); // TODO: Check if this should be zero? Ideally user would want a certain amount that can be factored as per 3% slippage
    await usdc.connect(user2).approve(uniswapV2Wrapper.address, amountInMax);
    const userUSDCBalanceBefore = await usdc.balanceOf(user2.address);
    const userNativeBalanceBefore = await ethers.provider.getBalance(
      user2.address
    );
    await uniswapV2Wrapper
      .connect(user2)
      .swapTokensForExactETH(usdc.address, amountOut, amountInMax);
    const userUsdcBalanceAfter = await usdc.balanceOf(user2.address);
    const userNativeBalanceAfter = await ethers.provider.getBalance(
      user2.address
    );
    expect(userUSDCBalanceBefore).to.be.gt(userUsdcBalanceAfter);
    expect(userNativeBalanceBefore).to.be.lt(userNativeBalanceAfter);
  });

  it("should swap ETH for exact tokens", async function () {
    const amountOut = ethers.utils.parseUnits("100", DECIMALS_IN_USDC);
    const amountInMax = ethers.utils.parseEther("1"); // TODO: Check if this should be zero? Ideally user would want a certain amount that can be factored as per 3% slippage
    const userUSDCBalanceBefore = await usdc.balanceOf(user2.address);
    const userNativeBalanceBefore = await ethers.provider.getBalance(
      user2.address
    );
    await uniswapV2Wrapper
      .connect(user2)
      .swapETHForExactTokens(usdc.address, amountOut, amountInMax, {
        value: amountInMax,
      });
    const userUsdcBalanceAfter = await usdc.balanceOf(user2.address);
    const userNativeBalanceAfter = await ethers.provider.getBalance(
      user2.address
    );
    expect(userUSDCBalanceBefore).to.be.lt(userUsdcBalanceAfter);
    expect(userNativeBalanceBefore).to.be.gt(userNativeBalanceAfter);
  });

  it("should swap tokens for exact tokens", async function () {
    const amountInMax = ethers.utils.parseUnits("1000", DECIMALS_IN_USDC);
    const amountOut = ethers.utils.parseEther(".1"); // TODO: Check if this should be zero? Ideally user would want a certain amount that can be factored as per 3% slippage
    await usdc.connect(user2).approve(uniswapV2Wrapper.address, amountInMax);
    const userUSDCBalanceBefore = await usdc.balanceOf(user2.address);
    const userWETHBalanceBefore = await weth.balanceOf(user2.address);
    await uniswapV2Wrapper
      .connect(user2)
      .swapTokensForExactTokens(
        usdc.address,
        weth.address,
        amountInMax,
        amountOut
      );
    const userUsdcBalanceAfter = await usdc.balanceOf(user2.address);
    const userWethBalanceAfter = await weth.balanceOf(user2.address);
    expect(userUSDCBalanceBefore).to.be.gt(userUsdcBalanceAfter);
    expect(userWETHBalanceBefore.add(amountOut)).to.be.equal(
      userWethBalanceAfter
    );
  });

  it("should add liquidity", async function () {
    const amountOfTokenA = ethers.utils.parseUnits("1000", DECIMALS_IN_USDC);
    const amountOfTokenB = ethers.utils.parseEther("2");
    await usdc.connect(user2).approve(uniswapV2Wrapper.address, amountOfTokenA);
    await weth.connect(user2).approve(uniswapV2Wrapper.address, amountOfTokenB);
    const [reserveABefore, reserveBBefore, totalSupplyBefore] =
      await uniswapV2Wrapper.pairInfo(usdc.address, weth.address);
    await uniswapV2Wrapper
      .connect(user2)
      .addLiquidity(usdc.address, weth.address, amountOfTokenA, amountOfTokenB);
    const [reserveAAfter, reserveBAfter, totalSupplyAfter] =
      await uniswapV2Wrapper.pairInfo(usdc.address, weth.address);
    // Verify that liquidity has been added
    expect(totalSupplyAfter).to.be.gt(totalSupplyBefore);
    expect(reserveAAfter).to.be.gt(reserveABefore);
    expect(reserveBAfter).to.be.gt(reserveBBefore);
  });

  // it("should add liquidity with ETH", async function() {
  //   const amountOfTokenA = ethers.utils.parseUnits("1000", DECIMALS_IN_USDC);
  //   const amountOfTokenB = ethers.utils.parseEther("2");
  //   await usdc.connect(user2).approve(uniswapV2Wrapper.address, amountOfTokenA);
  //   await weth.connect(user2).approve(uniswapV2Wrapper.address, amountOfTokenB);
  //   const [reserveTokenBefore, reserveETHBefore, totalSupplyBefore] = await uniswapV2Wrapper.pairInfo(usdc.address, chains[network.name].wethAddress);

  //   await uniswapV2Wrapper.connect(user).addLiquidityETH(usdc.address, amountTokenDesired, { value: ethers.utils.parseEther("1") });

  //   const [reserveTokenAfter, reserveETHAfter, totalSupplyAfter] = await uniswapV2Wrapper.pairInfo(usdc.address, chains[network.name].wethAddress);

  //   // Verify that liquidity has been added
  //   expect(totalSupplyAfter).to.be.gt(totalSupplyBefore);
  //   expect(reserveTokenAfter).to.be.gt(reserveTokenBefore);
  //   expect(reserveETHAfter).to.be.gt(reserveETHBefore);
  // });
});
