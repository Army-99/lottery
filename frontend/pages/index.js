import Head from 'next/head'
import Header from '../components/Header'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Lottery Contract</title>
        <meta name="description" content="Smart contract Lottery" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* HEADER CONNECT WALLET */}
      <Header/>
      <h1>LOTTERY</h1>

    </div>
  )
}
