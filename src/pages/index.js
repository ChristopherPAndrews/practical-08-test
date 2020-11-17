import Head from 'next/head'
import Link from 'next/Link';
import LoginStatus from '../components/LoginStatus';
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Authentication example</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
         Authentication example
        </h1>
<LoginStatus />
         <p><Link href="./secure"><a>Link to secure page</a></Link></p>
      </main>
    </div>
  )
}
