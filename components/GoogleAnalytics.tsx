'use client'

import { useEffect } from 'react'

export function GoogleAnalytics() {
  useEffect(() => {
    // Initialize Google Analytics
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || []
      function gtag(...args: any[]) {
        window.dataLayer.push(args)
      }
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
  }
}
