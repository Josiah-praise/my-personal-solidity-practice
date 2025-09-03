import { ethers } from "hardhat";

const whale = "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503";
const routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const chainlinkAddress = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
const shibaInuAddress = "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE";
let pairAddress;

const createAndFundPair = async () => {
  // impersonate whale
  const signer = await ethers.getImpersonatedSigner(whale);

  // give signer some eth for transaction signing
  const [deployer] = await ethers.getSigners();
  await deployer.sendTransaction({
    to: signer.address,
    value: ethers.parseEther("5"),
  });

  // get factoryContract
  const factoryContract = await ethers.getContractAt(
    "IUniswapV2Factory",
    factoryAddress,
    signer
  );

  // get router contract
  const routerContract = await ethers.getContractAt(
    "IUniswapV2Router01",
    routerAddress,
    signer
  );

  // get ERC contracts
  const shibaInuContract = await ethers.getContractAt(
    "IERC20",
    shibaInuAddress,
    signer
  );
  const chainlinkContract = await ethers.getContractAt(
    "IERC20",
    chainlinkAddress,
    signer
  );

  let pairContract;

  pairAddress = await factoryContract.getPair(
    shibaInuAddress,
    chainlinkAddress
  );

  const whaleShibaInuBalanceBeforeAdding = await shibaInuContract.balanceOf(
    signer.address
  );
  const whaleChainlinkBalanceBeforeAdding = await chainlinkContract.balanceOf(
    signer.address
  );

  // whale's balance logs before adding liquidity
  console.log("\n========== WHALE BALANCES BEFORE ADDING LIQUIDITY ==========");
  console.log(
    `Chainlink (LINK): ${Number(
      ethers.formatEther(whaleChainlinkBalanceBeforeAdding)
    ).toLocaleString()}`
  );
  console.log(
    `Shiba Inu (SHIB): ${Number(
      ethers.formatEther(whaleShibaInuBalanceBeforeAdding)
    ).toLocaleString()}`
  );
  console.log("============================================================\n");

  // check if it's address 0
  if (ethers.ZeroAddress == pairAddress) {
    // create pair
    await (
      await factoryContract.createPair(shibaInuAddress, chainlinkAddress)
    ).wait();
    pairAddress = await factoryContract.getPair(
      shibaInuAddress,
      chainlinkAddress
    );

    console.log("Pair/Pool contract created succesfully: ", pairAddress);
  }

  // get pair contract
  pairContract = await ethers.getContractAt("IERC20", pairAddress, signer);

  const pairShibaBalanceBeforeAddition = await shibaInuContract.balanceOf(
    pairAddress
  );
  const pairChainlinkBalanceBeforeAddition = await chainlinkContract.balanceOf(
    pairAddress
  );

  // pool log
  console.log("\n========== POOL BALANCES BEFORE ADDING LIQUIDITY ==========");
  console.log(
    `Shiba Inu (SHIB): ${Number(
      ethers.formatEther(pairShibaBalanceBeforeAddition)
    ).toLocaleString()}`
  );
  console.log(
    `Chainlink (LINK): ${Number(
      ethers.formatEther(pairChainlinkBalanceBeforeAddition)
    ).toLocaleString()}`
  );
  console.log("===========================================================\n");

  // add liquidity
  const amountOfShibaToBeAdded = ethers.parseEther("1");
  const amountOfLinkToBeAdded = ethers.parseEther("5800000");

  // approve router to spend
  await (
    await shibaInuContract.approve(routerAddress, amountOfLinkToBeAdded)
  ).wait();
  await (
    await chainlinkContract.approve(routerAddress, amountOfLinkToBeAdded)
  ).wait();

  // tell router to take funds
  await (
    await routerContract.addLiquidity(
      shibaInuAddress,
      chainlinkAddress,
      amountOfShibaToBeAdded,
      amountOfLinkToBeAdded,
      0,
      0,
      signer.address,
      Math.ceil(Date.now() / 1000) + 3600
    )
  ).wait();

  // ideally...should be successfull
  // let's check balances
  const pairShibaBalanceAfterAddition = await shibaInuContract.balanceOf(
    pairAddress
  );
  const pairChainlinkBalanceAfterAddition = await chainlinkContract.balanceOf(
    pairAddress
  );

  // pool log
  console.log("\n========== POOL BALANCES AFTER ADDING LIQUIDITY ==========");
  console.log(
    `Shiba Inu (SHIB): ${Number(
      ethers.formatEther(pairShibaBalanceAfterAddition)
    ).toLocaleString()}`
  );
  console.log(
    `Chainlink (LINK): ${Number(
      ethers.formatEther(pairChainlinkBalanceAfterAddition)
    ).toLocaleString()}`
  );
  console.log("===========================================================\n");

  const whaleShibaInuBalanceAfterAdding = await shibaInuContract.balanceOf(
    signer.address
  );
  const whaleChainlinkBalanceAfterAdding = await chainlinkContract.balanceOf(
    signer.address
  );

  // whale's balance logs after adding liquidity
  console.log("\n========== WHALE BALANCES AFTER ADDING LIQUIDITY ==========");
  console.log(
    `Chainlink (LINK): ${Number(
      ethers.formatEther(whaleChainlinkBalanceAfterAdding)
    ).toLocaleString()}`
  );
  console.log(
    `Shiba Inu (SHIB): ${Number(
      ethers.formatEther(whaleShibaInuBalanceAfterAdding)
    ).toLocaleString()}`
  );
  console.log("============================================================\n");

  console.log(
    `---------------Actual amount of shiba taken: ${ethers.formatEther(
      whaleShibaInuBalanceBeforeAdding - whaleShibaInuBalanceAfterAdding
    )}`
  );

  console.log(
    `---------------Actual amount of link taken: ${ethers.formatEther(
      whaleChainlinkBalanceBeforeAdding - whaleChainlinkBalanceAfterAdding
    )}`
  );
};

createAndFundPair().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
