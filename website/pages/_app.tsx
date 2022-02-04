import '@elastic/eui/dist/eui_theme_light.css'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import './app.css';

const app = ({ Component, pageProps }) => {

  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = (url: any) => {
      // if (gtag && gtag.pageview) gtag.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (<>
    <Head>
      <title>Bio2KG Registry</title>
    </Head>
    <Component {...pageProps} />
  </>)
}

export default app