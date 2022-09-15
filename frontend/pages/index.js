import Head from 'next/head'
import BestHeader from '../components/BestHeader'
import LotteryEntrance from '../components/LotteryEntrance'
import Countdown from '../components/UI/Countdown'

export default function Home() {
  return (
    <div className='h-screen text-white bg-black'>
      <Head>
        <title>Lottery</title>
        <meta name="description" content="Smart contract Lottery" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BestHeader/>
      <LotteryEntrance></LotteryEntrance>
    </div>
  )
}
