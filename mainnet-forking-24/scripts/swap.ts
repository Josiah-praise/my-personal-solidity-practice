import { ethers } from "hardhat";

const swap = async () => {
  const whale_address = "0xA26148AE51fa8E787DF319C04137602Cc018b521";

  const whale = await ethers.getImpersonatedSigner(whale_address);

  // give whale gas
  const signer1 = (await ethers.getSigners())[0];
  await signer1.sendTransaction({
    to: whale.address,
    value: ethers.parseEther("20"), // 5 ETH
  });

  const usdt_address = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  const usdc_address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const v3Router_address = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
  const v3Factory_address = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
  const quoter_address = "";

  // create the contracts for all these
  const usdt_contract = await ethers.getContractAt(
    "IERC20",
    usdt_address,
    whale
  );
  const usdc_contract = await ethers.getContractAt(
    "IERC20",
    usdc_address,
    whale
  );
  const v3Factory_contract = await ethers.getContractAt(
    "IUniswapV3Factory",
    v3Factory_address,
    whale
  );
  const v3Router_contract = await ethers.getContractAt(
    "ISwapRouter",
    v3Router_address,
    whale
  );

  // check for pool for this usdc and usdt on v3
  const pool_address = await v3Factory_contract.getPool(
    usdc_address,
    usdt_address,
    3000
  );

  if (pool_address === ethers.ZeroAddress) {
    console.log("Pool doesn't exist");
    process.exit(1);
  } else {
    console.log("================,===========Pool address:",pool_address,"==================");
  }

  // calculate pool reserves
  // const pool_contract = await ethers.getContractAt(
  //   "IUniswapV3Pool",
  //   pool_address,
  //   whale
  // );

  const usdcBalanceBeforeSwap = await usdc_contract.balanceOf(pool_address);
  const usdtBalanceBeforeSwap = await usdt_contract.balanceOf(pool_address);
  const usdcWhaleBalanceBeforeSwap = await usdc_contract.balanceOf(
    whale.address
  );
  const usdtWhaleBalanceBeforeSwap = await usdt_contract.balanceOf(
    whale.address
  );

  console.log(
    `=============Whale has ${ethers.formatUnits(
      usdcWhaleBalanceBeforeSwap,
      6
    )}============units of usdc`
  );
  console.log(
    `=============Whale has ${ethers.formatUnits(
      usdtWhaleBalanceBeforeSwap,
      6
    )}=============units of usdt`
  );

  console.log(
    `=============Pool has ${ethers.formatUnits(
      usdcBalanceBeforeSwap,
      6
    )}============units of usdc`
  );
  console.log(
    `=============Pool has ${ethers.formatUnits(
      usdtBalanceBeforeSwap,
      6
    )}=============units of usdt`
  );

  // swap 1000 usdt for USDC
  console.log("Swapping 1000 USDT for USDC...");
  const amountOut = ethers.parseUnits("1000", 6); // 1000
  const maxAmountIn = ethers.parseUnits("10000", 6); // 1000 USDT

  // approve the v3 router to spend USDT
  await(await usdt_contract.approve(
    v3Router_address,
    maxAmountIn
  )).wait();

  await (await v3Router_contract.exactOutputSingle(
    {
      tokenIn: usdt_address,
      tokenOut: usdc_address,
      fee: 3000,
      recipient: whale.address,
      deadline: Math.floor(Date.now() / 1000) + 60 * 5, // 5 minutes from now
      amountOut: amountOut,
      amountInMaximum: maxAmountIn, // no slippage protection
      sqrtPriceLimitX96: 0, // no price limit
    }
  )).wait();

  // log the balaneces of both tokens after the swap
  const usdcBalanceAfterSwap = await usdc_contract.balanceOf(pool_address);
  const usdtBalanceAfterSwap = await usdt_contract.balanceOf(pool_address);
  const usdcWhaleBalanceAfterSwap = await usdc_contract.balanceOf(
    whale.address
  );
  const usdtWhaleBalanceAfterSwap = await usdt_contract.balanceOf(
    whale.address
  );

  console.log(
    `=============Whale has ${ethers.formatUnits(
      usdcWhaleBalanceAfterSwap,
      6
    )}============units of usdc`
  );
  console.log(
    `=============Whale has ${ethers.formatUnits(
      usdtWhaleBalanceAfterSwap,
      6
    )}=============units of usdt`
  );

  console.log(
    `=============Pool has ${ethers.formatUnits(
      usdcBalanceAfterSwap,
      6
    )}============units of usdc`
  );
  console.log(
    `=============Pool has ${ethers.formatUnits(
      usdtBalanceAfterSwap,
      6
    )}=============units of usdt`
  );  
};

swap().catch((err) => {
  console.error(err);
  process.exit(1);
});
