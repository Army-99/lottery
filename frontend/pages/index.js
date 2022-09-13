import Head from 'next/head'
import BestHeader from '../components/BestHeader'
import LotteryEntrance from '../components/LotteryEntrance'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Lottery Contract</title>
        <meta name="description" content="Smart contract Lottery" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BestHeader/>

      <LotteryEntrance></LotteryEntrance>
    </div>
  )
}
