
import {useState, useEffect} from 'react';
import Head from 'next/head'
import {useSession} from 'next-auth/client';
import styles from '../styles/Home.module.css'

export default function SecurePage() {
  const [secret, setSecret] = useState();
  const [session, loading] = useSession();

    if (loading) return null;

  if (!loading && !session) return <p>Access Denied</p>


  useEffect(()=>{
    const getSecret = async ()=>{
      const response = await fetch('/api/secret');
      if (response.ok){
        const data = await response.json();
        setSecret(data.message);
      }
    
    };
    getSecret();
  }, [session]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Auth test</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Authentication test site
        </h1>

        <p>This is a private page only logged in users can see</p>
    <p>{secret}</p>
      </main>


    </div>
  )
}