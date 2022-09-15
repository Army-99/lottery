import { ConnectButton } from '@web3uikit/web3';

const BestHeader = () => {
    return(
        <div className='p-5 border-b-2 flex flex-row relative'>
            <h1 className='py-5 px-5 text-xl'>Lottery VRF</h1>
            <div className='py-5 px-5 ml-auto'>
                <ConnectButton moralisAuth={false}></ConnectButton>
            </div>
        </div>
    )
}

export default BestHeader;