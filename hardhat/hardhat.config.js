require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config()

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL;
const BSC_RPC_URL = process.env.BSC_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API = process.env.ETHERSCAN_API_KEY;
const MUMBAI_API = process.env.MUMBAI_API_KEY;
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        localhost: {
            chainId: 31337,
            blockConfirmations: 1
        },
        goerli: {
            chainId: 5,
            blockConfirmations: 6,
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY]
        },
        mumbai: {
            chainId: 80001,
            blockConfirmations: 6,
            url: MUMBAI_RPC_URL,
            accounts: [PRIVATE_KEY]
        },
        bsctestnet: {
            chainId: 97,
            blockConfirmations: 6,
            url: BSC_RPC_URL,
            accounts: [PRIVATE_KEY]
        },
    },
    solidity: "0.8.7",
    namedAccounts: {
        deployer: {
            default: 0,
        },
        player: {
            default: 1,
        },
    },
    mocha: {
        timeout: 200000
    },
    etherscan: {
        apiKey: {
          polygonMumbai: MUMBAI_API,
          goerli: ETHERSCAN_API,
          bscTestnet: BSCSCAN_API_KEY
        }
    }

};