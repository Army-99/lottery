import { useWeb3Contract } from 'react-moralis';
import {abi, contractAddresses} from "../constants";
import { useMoralis } from 'react-moralis';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useNotification } from '@web3uikit/core';
import { Bell } from '@web3uikit/icons'


const LotteryEntrance = () => {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
    const chainID = parseInt(chainIdHex);
    const lotteryAddress = chainID in contractAddresses ? contractAddresses[chainID][0] : null;
    const [ entranceFee, setEntranceFee ] = useState("0");
    const [ numPlayers, setNumberPlayers ] = useState("0");
    const [ recentWinner, setRecentWinner ] = useState("");

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
        const entranceFeeCall = (await getEntranceFee()).toString();
        const numPlayersCall = (await getPlayersNumber()).toString();
        const recentWinnerCall = await getRecentWinner();
        setEntranceFee(entranceFeeCall);
        setNumberPlayers(numPlayersCall);
        setRecentWinner(recentWinnerCall);
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled])

    /* NOTIFICATIONS */
    const handleSuccess = async(tx) => {
        await tx.wait(1);
        handleNewNotification(tx);
        updateUIValues();
    }

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR",
            icon: <Bell fontSize={20}/>
        })
    }

    return(
        <div className='p-5'>
            { lotteryAddress ? 
            <>
                <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full ml-auto' onClick={async() => {
                                            await enterLottery({
                                                onSuccess: handleSuccess,
                                                onError: (error) => console.error(error)
                                            })
                                            }}>{}</button>
                <p>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</p>
                <p>Number Of Players: {numPlayers}</p>
                <p>Last Winner: {recentWinner}</p>
            </>
            :
            <div>
                The chain is not supported yet!
            </div>
            }
        </div>
    );
}

export default LotteryEntrance;