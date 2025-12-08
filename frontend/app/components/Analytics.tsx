'use client'

import {useEffect, useState} from 'react'

const GTM_ID = 'GTM-P93ZXQHD'
const GA_ID = 'G-8PKFNX2P1W'

/**
 * Analytics component that loads GTM and GA4 only after user interaction.
 * This improves Core Web Vitals by deferring non-essential JavaScript.
 */
export function Analytics() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded) return

    const loadAnalytics = () => {
      if (loaded) return
      setLoaded(true)

      // Initialize dataLayer
      window.dataLayer = window.dataLayer || []

      // Load GTM
      const gtmScript = document.createElement('script')
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_ID}');
      `
      document.head.appendChild(gtmScript)

      // Load GA4
      const gaScript = document.createElement('script')
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
      gaScript.async = true
      document.head.appendChild(gaScript)

      gaScript.onload = () => {
        window.gtag = function () {
          window.dataLayer.push(arguments)
        }
        window.gtag('js', new Date())
        window.gtag('config', GA_ID)
      }
    }

    // Load on first user interaction
    const events = ['click', 'scroll', 'keydown', 'touchstart']
    events.forEach((event) => {
      window.addEventListener(event, loadAnalytics, {once: true, passive: true})
    })

    // Also load after 5 seconds as fallback (for users who don't interact)
    const timeout = setTimeout(loadAnalytics, 5000)

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, loadAnalytics)
      })
      clearTimeout(timeout)
    }
  }, [loaded])

  return null
}

// Type declarations for window
declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}
