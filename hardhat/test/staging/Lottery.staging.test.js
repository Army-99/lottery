const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");


developmentChains.includes(network.name) 
    ? describe.skip()
    : describe("Lottery Unit Test", function() {
        let lottery, lotteryEntranceFee, deployer;

        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer;
            lottery = await ethers.getContract("Lottery", deployer);
            lotteryEntranceFee = await lottery.getEntranceFee();
        });

        describe("FulfillRandomWords", function () {
            it("Works with live Chainlink Keepers and VRF", async () => {
                //enter Lottery
                const startingTimeStamp = lottery.getLatestTimeStamp();

                
                await new Promise(async (resolve, reject) => { 
                    lottery.once("LotteryWinner", async () => {
                        console.log("Winner is picked");
                        try{
                            //asserts here
                            const recentWinner = await lottery.getRecentWinner();
                            const lotteryState = await lottery.getLotteryState();
                            const endingTimeStamp = await lottery.getLatestTimeStamp();
                            const numPlayers = await lottery.getNumberOfPlayers();
                            const winnerEndingBalance=await accounts[1].getBalance();
                        }catch(err){
                            reject(err);
                        }
                        resolve();
                    });
                    //Entering
                    await lottery.enterLotter({ value: lotteryEntranceFee });

                });
            });

            
        });
});