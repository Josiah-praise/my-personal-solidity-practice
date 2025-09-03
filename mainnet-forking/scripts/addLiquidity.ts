import { ethers, network } from "hardhat";

const whaleAddress = "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503";
const routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
let pairAddress;
const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

async function addLiquidity() {
  // get pairAddress
  const factoryContract = await ethers.getContractAt(
    "IUniswapV2Factory",
    factoryAddress
  );
  pairAddress = await factoryContract.getPair(usdtAddress, daiAddress);
  console.log(`Pair Address: -------------------------${pairAddress}`);
  // impersonate whale
  const signer = await ethers.getImpersonatedSigner(whaleAddress);
  const [deployer] = await ethers.getSigners();

  // balance before sending eth
  console.log(
    `Whale's ETH balance before receiving eth ${ethers.formatEther(
      await ethers.provider.getBalance(await signer.getAddress())
    )}`
  );

  // give whale some eth for signing transactions
  await deployer.sendTransaction({
    to: signer.address,
    value: ethers.parseEther("10"),
  });

  console.log(
    `Whale's ETH balance after receiving eth ${ethers.formatEther(
      await ethers.provider.getBalance(await signer.getAddress())
    )}`
  );

  const daiContract = await ethers.getContractAt("IERC20", daiAddress, signer);
  const routerContract = await ethers.getContractAt(
    "IUniswapV2Router01",
    routerAddress,
    signer
  );
  const usdtContract = await ethers.getContractAt(
    "IERC20",
    usdtAddress,
    signer
  );
  const pairContract = await ethers.getContractAt(
    "IUniswapV2Pair",
    pairAddress,
    signer
  );

  // show the whale's usdt and dai balances before adding liquidity
  const whalesUsdtBalanceBeforeAdding = await usdtContract.balanceOf(
    await signer.getAddress()
  );
  const whalesDaiBalanceBeforeAdding = await daiContract.balanceOf(
    await signer.getAddress()
  );

  console.log(
    `------------------------------------------------The Usdt balance of the whale before adding liquidity is ${ethers.formatUnits(
      whalesUsdtBalanceBeforeAdding,
      6
    )}`
  );
  console.log(
    `------------------------------------------------The Dai balance of the whale before adding liquidity is ${ethers.formatEther(
      whalesDaiBalanceBeforeAdding
    )}`
  );

  // get initial balance of usdt and dai in the pool
  const UsdtInPoolBeforeAdding = await usdtContract.balanceOf(pairAddress);
  const DaiInPoolBeforeAdding = await daiContract.balanceOf(pairAddress);

  console.log(
    `------------------------------------------------Balance of Usdt in pool before whale added liquidity: ${ethers.formatUnits(
      UsdtInPoolBeforeAdding,
      6
    )}`
  );
  console.log(
    `------------------------------------------------Balance of Dai in pool before whale added liquidity: ${ethers.formatEther(
      DaiInPoolBeforeAdding
    )}`
  );

  const amountOfDaiToAddToPool = ethers.parseEther("10");
  const amountOfUsdtToAddToPool = ethers.parseUnits("10", 6);

  // approve the router to take erc20 pair
  await(
    await daiContract.approve(routerAddress, amountOfDaiToAddToPool)
  ).wait();
  await(
    await usdtContract.approve(routerAddress, amountOfUsdtToAddToPool)
  ).wait();

  // tell the router to add liquidity
  await(
    await routerContract.addLiquidity(
      usdtAddress,
      daiAddress,
      amountOfUsdtToAddToPool,
      amountOfDaiToAddToPool,
      ethers.parseUnits(".5", 6),
      ethers.parseEther(".5"),
      signer.address,
      Math.ceil(Date.now() / 1000)
    )
  ).wait();

  // get initial balance of usdt and dai in the pool
  const UsdtInPoolAfterAdding = await usdtContract.balanceOf(pairAddress);
  const DaiInPoolAfterAdding = await daiContract.balanceOf(pairAddress);

  console.log(
    `------------------------------------------------Balance of Usdt in pool after whale added liquidity: ${ethers.formatUnits(
      UsdtInPoolAfterAdding,
      6
    )}`
  );
  console.log(
    `------------------------------------------------Balance of Dai in pool after whale added liquidity: ${ethers.formatEther(
      DaiInPoolAfterAdding
    )}`
  );

  // show the whale's usdt and dai balances after adding liquidity
  const whalesUsdtBalanceAfterAdding = await usdtContract.balanceOf(
    await signer.getAddress()
  );
  const whalesDaiBalanceAfterAdding = await daiContract.balanceOf(
    await signer.getAddress()
  );

  console.log(
    `------------------------------------------------The Usdt balance of the whale after adding liquidity is ${ethers.formatUnits(
      whalesUsdtBalanceAfterAdding,
      6
    )}`
  );
  console.log(
    `------------------------------------------------The Dai balance of the whale after adding liquidity is ${ethers.formatEther(
      whalesDaiBalanceAfterAdding
    )}`
  );
    
    console.log(
        `---------------Actual amount of dai taken: ${ethers.formatEther(whalesDaiBalanceBeforeAdding - whalesDaiBalanceAfterAdding)}`
    )

    console.log(
      `---------------Actual amount of usdt taken: ${ethers.formatUnits(
        whalesUsdtBalanceBeforeAdding - whalesUsdtBalanceAfterAdding, 6
      )}`
    );
}

addLiquidity().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
