const { ethers, network } = require("hardhat");
const fs = require("fs");

const FRONTEND_PATH_ADDRESSES="../frontend/constants/contractAddresses.json";
const FRONTEND_PATH_ABI="../frontend/constants/abi.json";

module.exports = async () => {
    if(process.env.UPDATE_FRONTEND){
        console.log("Updating Frontend..");
        updateContractAddresses();
        updateAbi();
    }
}

const updateContractAddresses = async() => {
    console.log("Updating Addresses")
    const lottery = await ethers.getContract("Lottery");
    const chainId = network.config.chainId.toString();
    console.log("Chain: " + chainId);
    const currentAddresses = JSON.parse(fs.readFileSync(FRONTEND_PATH_ADDRESSES, "utf8"));
    if(chainId in currentAddresses){
        if(!currentAddresses[chainId].includes(lottery.address))
        {
            currentAddresses[chainId].push(lottery.address);
        }
    }
    else{
        currentAddresses[chainId]= [lottery.address];
    }
    fs.writeFileSync(FRONTEND_PATH_ADDRESSES, JSON.stringify(currentAddresses));
}

const updateAbi = async() => {
    const lottery = await ethers.getContract("Lottery");
    fs.writeFileSync(FRONTEND_PATH_ABI, lottery.interface.format(ethers.utils.FormatTypes.json));
}

module.exports.tags = ["all", "frontend"];

