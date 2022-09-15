import { useWeb3Contract } from 'react-moralis';
import {abi, contractAddresses} from "../constants";
import { useMoralis } from 'react-moralis';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useNotification } from '@web3uikit/core';
import Countdown from './UI/Countdown';

const LotteryEntrance = () => {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
    const chainID = parseInt(chainIdHex);
    const lotteryAddress = chainID in contractAddresses ? contractAddresses[chainID][0] : null;
    const [ entranceFee, setEntranceFee ] = useState("0");
    const [ numPlayers, setNumberPlayers ] = useState("0");
    const [ recentWinner, setRecentWinner ] = useState("");
    const [ isLoading, setIsLoading ] = useState(false);

    const dispatch = useNotification();

    /* SMART CONTRACT CALLS */
    const { runContractFunction: enterLottery } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "enterLottery",
        params: {},
        msgValue: entranceFee
    });

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getEntranceFee",
        params: {},
    });

    const { runContractFunction: getPlayersNumber } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getRecentWinner",
        params: {},
    })
    
    const updateUIValues = async() => {
        const entranceFeeCall = await getEntranceFee();
        const numPlayersCall = await getPlayersNumber();
        const recentWinnerCall = await getRecentWinner();
        setEntranceFee(entranceFeeCall? entranceFeeCall.toString() : "0");
        setNumberPlayers(numPlayersCall? numPlayersCall.toString() : "0");
        setRecentWinner(recentWinnerCall);
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled])

    /* ON BUTTON CLICK */
    const HandleButton = async() => {
        setIsLoading(true);
        try{
            console.log()
            const tx = await enterLottery();
            await tx.wait(1);
            handleNewNotification("info","Transaction completed successfully");
            updateUIValues();
        }catch(error){
            handleNewNotification("error", "Transaction error");
        }finally{
            setIsLoading(false);
        }
    };

    const handleNewNotification = (type, msg) => {
        dispatch({
            type: type,
            message: msg,
            title: "Tx Notification",
            position: "topR",
        })
    }


    return(

        <div>
            { lotteryAddress ? 
            <>
                <h1></h1>
                <div className="text-center p-3">
                    <p>Cost</p>
                    <p>{ethers.utils.formatUnits(entranceFee, "ether")} ETH</p>
                </div>
                
                <div className="text-center p-3">
                    <p>Number Of Players</p>
                    <p>{numPlayers}</p>
                </div>
                
                <div className="text-center p-3">
                    <p>Last Winner</p>
                    <p>{recentWinner.slice(0,6)}...{recentWinner.slice(recentWinner.length-4,recentWinner.length)}</p>
                </div>
                
                <div className='flex justify-center'>
                    <button 
                    disabled={isLoading}
                    className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mt-2' 
                            onClick={HandleButton}>
                            {
                                (isLoading) 
                                ? <svg className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full" />
                                : <p>JOIN</p>
                            }
                    </button>
                </div>

            <Countdown></Countdown>    
            </>
            :
            (
                isWeb3Enabled 
                ?   <div className='flex items-center justify-center mt-20'>
                        <h1 className='text-2xl text-red-500'>The chain is not supported yet.</h1>
                    </div>
                :   <div className='flex items-center justify-center mt-20'>
                        <h1 className='text-2xl text-red-500'>Connect the wallet for play!</h1>
                    </div>
            )
            
            }
        </div>
    );
}

export default LotteryEntrance;