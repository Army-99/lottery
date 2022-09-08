//Enter in the lottery
//Pick a random winner
//Winner to be selected every X time
//Chainlink Oracle -> Random, Automated Execution(ChainLink Keeper)

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;


import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

error Lottery__NotEnoughETH();
error Lottery__TransferFailed();
error Lottery__NotOpen();
error Lottery__UpkeepNotNeeded(uint currentBalance,uint playersCounter,uint lotteryState);

/**
    @title Lottery Contract
    @author Christian Armato
    @dev Implemented chainlink VRF v2 and Chainlink Keepers
*/

contract Lottery is VRFConsumerBaseV2, KeeperCompatibleInterface{
    /* Type Declarations */
    enum LotteryState{
        OPEN,
        CALCULATING
    }

    /* State Variables */
    uint private immutable i_entranceFee;
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfCordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    /* Lottery Variables */
    address private s_recentWinner;
    LotteryState private s_lotteryState;
    uint private s_lastTimeStamp;
    uint private immutable i_interval;

    /* Events */
    event LotteryEnter(address indexed player);
    event RequestedLotteryWinner(uint indexed requestId);
    event LotteryWinner(address indexed winner);

    /* Functions */
    constructor (
        address vrfCordinatorV2,
        uint entranceFee,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint interval 
    ) VRFConsumerBaseV2(vrfCordinatorV2) {
        i_vrfCordinator = VRFCoordinatorV2Interface(vrfCordinatorV2);
        i_entranceFee = entranceFee;
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_lotteryState = LotteryState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_interval=interval;
    }

    function enterLottery() public payable{
        if(msg.value < i_entranceFee){
            revert Lottery__NotEnoughETH();
        }
        if(s_lotteryState != LotteryState.OPEN){
            revert Lottery__NotOpen();
        }
        s_players.push(payable(msg.sender));
        emit LotteryEnter(msg.sender);
    }

    /** 
        @dev Chainlink Keeper nodes call this function and when upkeepNeeded is true, it will give the win to winner
        To return true the following conditions should be verified:
            1) Interval should have passed
            2) The lottery players>1 and some ETH
            3) Our subscription is funded with LINK
            4) The lottery should be "open"
    */
    function checkUpkeep(bytes memory /* checkData */) public override returns(bool upkeepNeeded, bytes memory /* performData */){
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
        bool hasPlayers = (s_players.length > 0);
        bool hasBalance = (address(this).balance>0);
        bool isOpen = (LotteryState.OPEN == s_lotteryState);

        upkeepNeeded = (timePassed && hasPlayers && hasBalance && isOpen);
    }

    function performUpkeep(bytes calldata /* performData */) external override{
        (bool upkeepNeeded, ) = checkUpkeep("");

        if(!upkeepNeeded){
            revert Lottery__UpkeepNotNeeded(address(this).balance, s_players.length, uint(s_lotteryState));
        }

        s_lotteryState = LotteryState.CALCULATING;
        uint requestId = i_vrfCordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedLotteryWinner(requestId);
    }

    function fulfillRandomWords (uint /*requestId*/, uint [] memory randomWords) internal override {
        uint indexOfWinner = randomWords[0] % s_players.length;
        address payable winner = s_players[indexOfWinner];
        s_recentWinner = winner;
        s_players = new address payable [](0);
        s_lotteryState = LotteryState.OPEN;
        s_lastTimeStamp = block.timestamp;
        (bool success, ) = winner.call{value: address(this).balance}("");
        if(!success){
            revert Lottery__TransferFailed();
        }
        emit LotteryWinner(winner);
    }

    /* VIEW - PURE */
    function getEntranceFee() public view returns(uint){
        return i_entranceFee;
    }

    function getPlayer(uint index) public view returns(address){
        return s_players[index];
    }

    function getRecentWinner() public view returns(address){
        return s_recentWinner;
    }

    function getLotteryState() public view returns(LotteryState){
        return s_lotteryState;
    }

    function getNumberOfPlayers () public view returns (uint){
        return s_players.length;
    }

    function getLatestTimeStamp() public view returns (uint){
        return s_lastTimeStamp;
    }

    function getRequestConfirmations() public pure returns (uint){
        return REQUEST_CONFIRMATIONS;
    }

    function getInterval() public view returns (uint){
        return i_interval;
    }
}
