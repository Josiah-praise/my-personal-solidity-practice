import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from 'dotenv';

dotenv.config();
const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      accounts: [process.env.PRIVATE_KEY!],
      url: "https://eth-sepolia.g.alchemy.com/v2/oA3aWf4dW3KozyXiBJ5TiZHnXtykfedo",
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY!
    }
  }
};

export default config;
