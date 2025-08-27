import '../styles/globals.css'
import Head from 'next/head'

function DacrasApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Dacras AI - Transform Ideas Into Video Ads</title>
        <meta name="description" content="AI-powered video ad generation platform with realistic actors and professional scripts" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="Dacras AI - Video Ad Generation" />
        <meta property="og:description" content="Create compelling video advertisements with AI actors in minutes" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default DacrasApp