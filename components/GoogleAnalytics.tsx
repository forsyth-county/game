'use client'

import { useEffect } from 'react'

export function GoogleAnalytics() {
  useEffect(() => {
    // Initialize Google Analytics
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || []
      
      // Define gtag function and assign to window
      function gtag(...args: any[]) {
        window.dataLayer.push(args)
      }
      window.gtag = gtag
      
      gtag('js', new Date())
      gtag('config', 'G-FGXXN9EK0N')
    }
  }, [])

  return null
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}
