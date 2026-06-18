require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    pharos: {
      url: process.env.PHAROS_RPC_URL || "",
      chainId: parseInt(process.env.PHAROS_CHAIN_ID || "0"),
      accounts: process.env.PHAROS_PRIVATE_KEY ? [process.env.PHAROS_PRIVATE_KEY] : [],
    },
  },
};
