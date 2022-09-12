const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");


developmentChains.includes(network.name) 
    ? describe.skip
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
                const accounts = await ethers.getSigners();
                const startingTimeStamp = lottery.getLatestTimeStamp();
                await new Promise(async (resolve, reject) => { 
                    lottery.once("LotteryWinner", async () => {
                        console.log("Winner is picked");
                        try{
                            //asserts here
                            const recentWinner = await lottery.getRecentWinner();
                            const lotteryState = await lottery.getLotteryState();
                            const numPlayers = await lottery.getNumberOfPlayers();
                            const winnerEndingBalance=await accounts[0].getBalance();
                            const endingTimeStamp = await lottery.getLatestTimeStamp();

                            await expect(lottery.getPlayer(0)).to.be.reverted;
                            assert.equal(recentWinner.toString(), accounts[0].address);
                            assert.equal(lotteryState, 0);
                            assert.equal(winnerEndingBalance.toString(), winnerStartingBalance.add(lotteryEntranceFee.toString()));
                            assert(endingTimeStamp > startingTimeStamp);
                        }catch(err){
                            reject(err);
                        }
                        resolve();
                    });
                    //Entering
                    console.log("Entro nel contratto!");
                    await lottery.enterLottery({ value: lotteryEntranceFee });
                    console.log("Sono entrato..");
                    const winnerStartingBalance=await accounts[0].getBalance();
                });
            });

            
        });
});