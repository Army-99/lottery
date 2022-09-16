const { ethers } = require("hardhat");

const networkConfig = {
    5: {
        name: "goerli",
        vrfCordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: "1166",
        callbackGasLimit: "500000",
        interval: "30"
    },
    80001: {
        name: "mumbai",
        vrfCordinatorV2: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
        subscriptionId: "1810",
        callbackGasLimit: "2500000",
        interval: "30"
    },
    97: {
        name: "bsctestnet",
        vrfCordinatorV2: "0x6A2AAd07396B36Fe02a22b33cf443582f682c82f",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0xba6e730de88d94a5510ae6613898bfb0c3de5d16e609c5b7da808747125506f7",
        subscriptionId: "1829",
        callbackGasLimit: "2500000",
        interval: "30"
    },
    31337: {
        name: "hardhat",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        interval: "30",
        callbackGasLimit: "500000",
    }

};

const developmentChains = ["hardhat","localhost"];

module.exports = {
    networkConfig,
    developmentChains
}
