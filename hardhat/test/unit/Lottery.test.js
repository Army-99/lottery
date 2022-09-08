const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name) ? describe.skip : describe("Lottery Unit Test", function() {
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
        })
        it("returns false if lottery isn't open", async () => {
            await lottery.enterLottery({ value: lotteryEntranceFee })
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
            await network.provider.request({ method: "evm_mine", params: [] })
            await lottery.performUpkeep([]) // changes the state to calculating
            const lotteryState = await lottery.getLotteryState() // stores the new state
            const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([]) // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
            assert.equal(lotteryState.toString() == "1", upkeepNeeded == false)
        })
        it("returns false if enough time hasn't passed", async () => {
            await lottery.enterLottery({ value: lotteryEntranceFee })
            await network.provider.send("evm_increaseTime", [interval.toNumber() - 5]) // use a higher number here if this test fails
            await network.provider.request({ method: "evm_mine", params: [] })
            const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([]) // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
            assert(!upkeepNeeded)
        })
        it("returns true if enough time has passed, has players, eth, and is open", async () => {
            await lottery.enterLottery({ value: lotteryEntranceFee })
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
            await network.provider.request({ method: "evm_mine", params: [] })
            const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([]) // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
            assert(upkeepNeeded)
        })
    })

    describe("performUpkeep", function () {
        it("can only run if checkupkeep is true", async () => {
            await lottery.enterRaffle({ value: raffleEntranceFee })
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
            await network.provider.request({ method: "evm_mine", params: [] })
            const tx = await raffle.performUpkeep("0x") 
            assert(tx)
        })
        it("reverts if checkup is false", async () => {
            await expect(raffle.performUpkeep("0x")).to.be.revertedWith( 
                "Raffle__UpkeepNotNeeded"
            )
        })
        it("updates the raffle state and emits a requestId", async () => {
            // Too many asserts in this test!
            await raffle.enterRaffle({ value: raffleEntranceFee })
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
            await network.provider.request({ method: "evm_mine", params: [] })
            const txResponse = await raffle.performUpkeep("0x") // emits requestId
            const txReceipt = await txResponse.wait(1) // waits 1 block
            const raffleState = await raffle.getRaffleState() // updates state
            const requestId = txReceipt.events[1].args.requestId
            assert(requestId.toNumber() > 0)
            assert(raffleState == 1) // 0 = open, 1 = calculating
        })
    })

})
