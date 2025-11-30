import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-vyper";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  vyper: {
    version: "0.3.10",
  },
  networks: {
    kairos: {
      url:"https://public-en-kairos.node.kaia.io",
      accounts: ["0x3de47ad52eda235fbab25931a4f2723e621d9c75e0298adc3e8b63aa8fe7910e"],
    },
  },
  etherscan: {
      apiKey: {
        kairos: "unnecessary",
      },
      customChains: [
        {
          network: "kairos",
          chainId: 1001,
          urls: {
            apiURL: "https://kairos-api.kaiascan.io/hardhat-verify",
            browserURL: "https://kairos.kaiascan.io",
          },
        },
      ],
    },
};

export default config;
