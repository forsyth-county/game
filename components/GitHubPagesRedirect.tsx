'use client'

import { useEffect } from 'react'

/**
 * GitHubPagesRedirect Component
 * 
 * Automatically redirects users from the GitHub Pages URL to the primary Render deployment.
 * Only activates when the URL contains the GitHub Pages domain.
 */
export function GitHubPagesRedirect() {
  useEffect(() => {
    // Check if we're on the GitHub Pages URL
    if (window.location.hostname === 'forsyth-county.github.io' && window.location.pathname.startsWith('/portal/')) {
      // Redirect to the Render deployment
      window.location.replace('https://forsyth.onrender.com/')
    }
  }, [])

  // This component doesn't render anything
  return null
}
