'use client'

import { useEffect } from 'react'

export function VisitorTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch('https://portal-t795.onrender.com/api/visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: window.location.pathname
          })
        })
      } catch (err) {
        // Silently fail for visitor tracking
        console.log('Visitor tracking failed:', err)
      }
    }

    trackVisit()
  }, [])

  return null
}
