const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name) 
    ? describe.skip()
    : describe("Lottery Unit Test", function() {
        let lottery, vrfCoordinator, lotteryEntranceFee, deployer, interval;
        const chainId = network.config.chainId;

        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer;
            await deployments.fixture(["all"]);
            lottery = await ethers.getContract("Lottery", deployer);
            vrfCoordinator = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
            lotteryEntranceFee = await lottery.getEntranceFee();
            interval = await lottery.getInterval();
        });

        describe("Constructor", function () {
            it("inizializes lottery correctly", async function () {
                const lotteryState = await lottery.getLotteryState();
                assert.equal(lotteryState.toString(), "0");
                assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
            });
        });

        describe("Enter Lottery", function () {
            it("revert when eth < entranceFee", async function () {
                await expect(lottery.enterLottery()).to.be.revertedWith("Lottery__NotEnoughETH");
            });

            it("Record player when enter", async function () {
                await lottery.enterLottery({value: lotteryEntranceFee});
                const player = await lottery.getPlayer(0);
                assert.equal(player, deployer);
            });

            it("Emits event on enter", async function () {
                await expect(lottery.enterLottery({value: lotteryEntranceFee})).to.emit(lottery, "LotteryEnter")
            });

            it("Doesn't allow to enter when the state is calculating", async function () {
                await lottery.enterLottery({value: lotteryEntranceFee});
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1 ]);
                await network.provider.send("evm_mine", []);
                await lottery.performUpkeep([]);
                await expect(lottery.enterLottery({value: lotteryEntranceFee})).to.be.revertedWith("Lottery__NotOpen");
            });
        });

        describe("CheckUpkeep", function () {
            it("returns false if people haven't sent any ETH", async () => {
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                const { upkeepNeeded } = await lottery.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                assert(!upkeepNeeded)
            });
            it("returns false if lottery isn't open", async () => {
                await lottery.enterLottery({ value: lotteryEntranceFee });
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                await network.provider.request({ method: "evm_mine", params: [] });
                await lottery.performUpkeep([]); // changes the state to calculating
                const lotteryState = await lottery.getLotteryState() // stores the new state
                const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([]); // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                assert.equal(lotteryState.toString() == "1", upkeepNeeded == false);
            });
            it("returns false if enough time hasn't passed", async () => {
                await lottery.enterLottery({ value: lotteryEntranceFee });
                await network.provider.send("evm_increaseTime", [interval.toNumber() - 5]); // use a higher number here if this test fails
                await network.provider.request({ method: "evm_mine", params: [] });
                const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([]); // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                assert(!upkeepNeeded);
            });
            it("returns true if enough time has passed, has players, eth, and is open", async () => {
                await lottery.enterLottery({ value: lotteryEntranceFee });
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                await network.provider.request({ method: "evm_mine", params: [] });
                const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([]); // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                assert(upkeepNeeded);
            });
        });

        describe("PerformUpkeep", function () {
            it("can only run if checkupkeep is true", async () => {
                await lottery.enterLottery({ value: lotteryEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                const tx = await lottery.performUpkeep("0x") 
                assert(tx)
            })
            it("reverts if checkup is false", async () => {
                await expect(lottery.performUpkeep("0x")).to.be.revertedWith( 
                    "Lottery__UpkeepNotNeeded"
                )
            })
            it("updates the raffle state and emits a requestId", async () => {
                // Too many asserts in this test!
                await lottery.enterLottery({ value: lotteryEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                const txResponse = await lottery.performUpkeep("0x") // emits requestId
                const txReceipt = await txResponse.wait(1) // waits 1 block
                const lotteryState = await lottery.getLotteryState() // updates state
                const requestId = txReceipt.events[1].args.requestId
                assert(requestId.toNumber() > 0)
                assert(lotteryState == 1) // 0 = open, 1 = calculating
            })
        });

        describe("FulfillRandomWords", function () {
            beforeEach(async () => {
                await lottery.enterLottery({ value: lotteryEntranceFee });
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                await network.provider.request({ method: "evm_mine", params: [] });
            });

            it("can only be called after performupkeep", async () => {
                await expect(
                    vrfCoordinator.fulfillRandomWords(0, lottery.address) // reverts if not fulfilled
                ).to.be.revertedWith("nonexistent request");
                await expect(
                    vrfCoordinator.fulfillRandomWords(1, lottery.address) // reverts if not fulfilled
                ).to.be.revertedWith("nonexistent request");
            });

            it("Picks a winner, resets, and sends money", async () => {
                const additionalEntrances = 3;
                const startingIndex = 1;
                const accounts = await ethers.getSigners();
                for (let i = startingIndex; i < startingIndex + additionalEntrances; i++) { // i = 2; i < 5; i=i+1
                    accountConnectedLottery = lottery.connect(accounts[i]) // Returns a new instance of the Lottery contract connected to player
                    await accountConnectedLottery.enterLottery({ value: lotteryEntranceFee })
                }
                const startingTimeStamp = await lottery.getLatestTimeStamp();

                await new Promise(async (resolve, reject) => {    
                    lottery.once("LotteryWinner", async () => {
                        try{
                            
                            const recentWinner = await lottery.getRecentWinner();
                            console.log("Winner: " + recentWinner);
                            console.log(accounts[0].address);
                            console.log(accounts[1].address);
                            console.log(accounts[2].address);
                            console.log(accounts[3].address);
                            const lotteryState = await lottery.getLotteryState();
                            const endingTimeStamp = await lottery.getLatestTimeStamp();
                            const numPlayers = await lottery.getNumberOfPlayers();
                            const winnerEndingBalance=await accounts[1].getBalance();
                            assert.equal(numPlayers.toString(),"0");
                            assert.equal(lotteryState.toString(),"0");
                            assert(endingTimeStamp > startingTimeStamp);

                            assert.equal(
                                    winnerEndingBalance.toString(),
                                    winnerStartingBalance.add(
                                        lotteryEntranceFee
                                            .mul(additionalEntrances)
                                            .add(lotteryEntranceFee)
                                            .toString()
                                    ));
                        }catch(err){
                            reject(err);
                        }
                        resolve();
                    });

                    const tx = await lottery.performUpkeep([]);
                    const txReceipt = await tx.wait(1);
                    const winnerStartingBalance=await accounts[1].getBalance();
                    await vrfCoordinator.fulfillRandomWords(txReceipt.events[1].args.requestId, lottery.address);
                });
            });
        });
    })
