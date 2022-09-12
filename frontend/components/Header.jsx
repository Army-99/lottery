import { useEffect } from 'react';
import {useMoralis} from 'react-moralis';

const Header = () => {
    const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } = useMoralis();

    useEffect(() => {
        if(isWeb3Enabled) return;
        if(typeof window !== "undefined"){
            if(window.localStorage.getItem("connected"))
            {
                enableWeb3();
            }     
        }
    },[isWeb3Enabled]);

    useEffect(() => {
        Moralis.onAccountChanged((account)=> {
            console.log(`Account changed to: ${account}`);
            if(account == null)
            {
                window.localStorage.removeItem("connected");
                deactivateWeb3();
            }
        })
    },[]);

    const Clicked = async(e) => {
        e.preventDefault();
        const ret = await enableWeb3();
        if(typeof window !== "undefined"){
            window.localStorage.setItem("connected","injected");
        }
    } 

    return(
        <div>
            {account ? 
            <div>Connected to {account.slice(0,6)}...{account.slice(account.length-4,account.length)}</div> 
            :<button onClick={Clicked} disabled={isWeb3EnableLoading}>Connect</button>
            }
        </div>
    )
}

export default Header;