import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import * as dotenv from 'dotenv';

dotenv.config();
const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/oA3aWf4dW3KozyXiBJ5TiZHnXtykfedo",
      },
    },
  },
};

// eth-mainnet.g.alchemy.com/v2/
export default config;
