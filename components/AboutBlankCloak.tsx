'use client'

import { useEffect } from 'react'

/**
 * AboutBlankCloak component
 *
 * When enabled (via localStorage toggle), this component opens the site in an
 * `about:blank` window with the full page rendered inside an iframe. The address
 * bar of the new window shows "about:blank" while the user interacts with the
 * site normally through the iframe.
 *
 * How it works:
 * 1. On mount, checks if the feature is enabled in localStorage.
 * 2. If the page is already loaded inside the about:blank iframe (detected via
 *    a `__ab` query parameter), it skips activation to prevent recursion.
 * 3. Opens a new `about:blank` popup using `window.open()`.
 * 4. Writes a full-page iframe into the popup that points back to the current
 *    URL with `?__ab=1` appended to prevent re-triggering.
 * 5. Replaces the original tab with a benign page (or navigates away).
 *
 * Limitations:
 * - Popup blockers may prevent `window.open()` from working unless called from
 *   a user gesture. The component stores the preference so the user can retry.
 * - Some browsers restrict writing into `about:blank` windows created via
 *   `window.open()`, though modern Chrome/Edge/Safari allow it.
 * - Cross-origin restrictions within the iframe are the same as loading the
 *   site directly; third-party cookies or embedded content may behave
 *   differently depending on browser policy.
 * - The original URL cannot be preserved in the address bar of the new window
 *   because it is genuinely `about:blank`.
 * - `history.pushState` / `history.replaceState` cannot change the URL of an
 *   `about:blank` document to a different origin.
 */
export function AboutBlankCloak() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // If we are already inside the about:blank iframe, do nothing.
    const params = new URLSearchParams(window.location.search)
    if (params.get('__ab') === '1') return

    // Check if the feature is enabled
    const enabled = localStorage.getItem('forsyth-ab-cloak') === 'true'
    if (!enabled) return

    // Build the URL to load inside the iframe (append __ab=1 to prevent loop)
    const iframeUrl = new URL(window.location.href)
    iframeUrl.searchParams.set('__ab', '1')

    // Try to open an about:blank window
    const popup = window.open('about:blank', '_blank')

    if (popup) {
      // Write a minimal HTML document with a full-viewport iframe
      popup.document.open()
      popup.document.write(
        '<!DOCTYPE html>' +
        '<html lang="en">' +
        '<head>' +
        '<meta charset="utf-8"/>' +
        '<meta name="viewport" content="width=device-width,initial-scale=1"/>' +
        '<title>Forsyth Educational Portal</title>' +
        '<style>' +
        'html,body{margin:0;padding:0;height:100%;overflow:hidden;background:#000}' +
        'iframe{border:none;width:100%;height:100%;display:block}' +
        '</style>' +
        '</head>' +
        '<body>' +
        '<iframe src="' + iframeUrl.href + '" ' +
        'allow="fullscreen; autoplay; clipboard-write; encrypted-media" ' +
        'sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads allow-popups-to-escape-sandbox" ' +
        'allowfullscreen></iframe>' +
        '</body>' +
        '</html>'
      )
      popup.document.close()
      popup.focus()

      // Replace the original tab with a benign destination so the user
      // doesn't see two copies of the site.
      window.location.replace('https://google.com')
    }
    // If the popup was blocked, silently degrade — the site still works
    // normally in the current tab.
  }, [])

  return null
}
