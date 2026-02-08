'use client'

import { useEffect, useRef } from 'react'

export function VisitorTracker() {
  const hasTracked = useRef(false)
  const lastPageRef = useRef('')

  useEffect(() => {
    const trackVisit = async () => {
      try {
        const currentPage = window.location.pathname
        
        // Track initial visit and page changes
        if (!hasTracked.current || currentPage !== lastPageRef.current) {
          await fetch('https://portal-t795.onrender.com/api/visit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              page: currentPage,
              timestamp: Date.now(),
              userAgent: navigator.userAgent,
              referrer: document.referrer
            })
          })
          
          hasTracked.current = true
          lastPageRef.current = currentPage
          
          console.log(`Visitor tracked: ${currentPage} at ${new Date().toISOString()}`)
        }
      } catch (err) {
        // Silently fail for visitor tracking but log for debugging
        console.log('Visitor tracking failed:', err)
      }
    }

    // Track immediately on mount
    trackVisit()

    // Track page changes (SPA navigation)
    const handleRouteChange = () => {
      setTimeout(trackVisit, 100) // Small delay to ensure route is updated
    }

    // Listen for navigation events
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handleRouteChange)
      
      // Override pushState and replaceState to catch SPA navigation
      const originalPushState = history.pushState
      const originalReplaceState = history.replaceState
      
      history.pushState = function(...args) {
        originalPushState.apply(history, args)
        handleRouteChange()
      }
      
      history.replaceState = function(...args) {
        originalReplaceState.apply(history, args)
        handleRouteChange()
      }
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange)
        history.pushState = originalPushState
        history.replaceState = originalReplaceState
      }
    }
  }, [])

  return null
}
