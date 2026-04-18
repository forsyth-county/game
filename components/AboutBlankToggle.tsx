'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Rocket, ShieldAlert, AlertCircle, CheckCircle2 } from 'lucide-react'

export function AboutBlankToggle() {
  const [enabled, setEnabled] = useState(false)
  const [justEnabled, setJustEnabled] = useState(false)
  const [popupBlocked, setPopupBlocked] = useState(false)
  const [launching, setLaunching] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEnabled(localStorage.getItem('forsyth-ab-cloak') === 'true')
    }
  }, [])

  const toggle = () => {
    const next = !enabled
    setEnabled(next)
    localStorage.setItem('forsyth-ab-cloak', String(next))
    setJustEnabled(next)
  }

  const openInAboutBlank = () => {
    setPopupBlocked(false)
    setLaunching(true)

    const url = new URL(window.location.origin)
    url.searchParams.set('__ab', '1')

    // Must be called synchronously in the click handler to avoid popup blockers.
    const popup = window.open('about:blank', '_blank')

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      setPopupBlocked(true)
      setLaunching(false)
      return
    }

    // Build the page content using DOM APIs (no innerHTML on URL).
    const doc = popup.document
    doc.open()
    doc.write(
      '<!DOCTYPE html><html lang="en"><head>' +
      '<meta charset="utf-8"/>' +
      '<meta name="viewport" content="width=device-width,initial-scale=1"/>' +
      '<title>Forsyth Educational Portal</title>' +
      '<style>' +
        'html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#000}' +
        'iframe{border:none;width:100%;height:100%;display:block}' +
        '.loader{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;' +
          'background:#020408;z-index:9999;transition:opacity .4s ease}' +
        '.loader.hidden{opacity:0;pointer-events:none}' +
        '.spinner{width:44px;height:44px;border:3px solid rgba(0,238,255,.2);' +
          'border-top-color:#00eeff;border-radius:50%;animation:spin .8s linear infinite}' +
        '@keyframes spin{to{transform:rotate(360deg)}}' +
      '</style>' +
      '</head><body>' +
      '<div class="loader" id="loader"><div class="spinner"></div></div>' +
      '</body></html>'
    )
    doc.close()

    // Create iframe via DOM so src is safely assigned.
    const iframe = doc.createElement('iframe')
    iframe.src = url.href
    iframe.setAttribute('allow', 'fullscreen; autoplay; clipboard-write; encrypted-media; gamepad')
    iframe.setAttribute(
      'sandbox',
      'allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads allow-popups-to-escape-sandbox allow-pointer-lock'
    )
    iframe.allowFullscreen = true
    iframe.style.cssText = 'border:none;width:100%;height:100%;display:block'
    iframe.addEventListener('load', () => {
      const loader = doc.getElementById('loader')
      if (loader) {
        loader.classList.add('hidden')
        setTimeout(() => loader.parentNode?.removeChild(loader), 500)
      }
    })
    doc.body.appendChild(iframe)

    popup.focus()
    setLaunching(false)
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl hover:shadow-purple-500/10 transition-all duration-500">
      <div className="relative p-8 lg:p-10 space-y-6">
        {/* Section Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <ExternalLink className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
              About:Blank Cloaking
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              Open the site inside an about:blank tab for extra privacy
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          Opens the portal inside an{' '}
          <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-sm font-mono">
            about:blank
          </code>{' '}
          tab. The address bar shows <strong>about:blank</strong> instead of the real URL.
          All games, navigation, and settings work normally inside the window.
        </p>

        {/* Auto-cloak toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-slate-900 dark:text-white">
              Auto-cloak on visit
            </span>
          </div>
          <button
            onClick={toggle}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/40 ${
              enabled ? 'bg-purple-600' : 'bg-slate-600'
            }`}
            role="switch"
            aria-checked={enabled}
            aria-label="Toggle auto-cloak on visit"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* ── Large Launch Button ── */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openInAboutBlank}
          disabled={launching}
          aria-busy={launching}
          aria-live="polite"
          className="relative w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-700 hover:via-fuchsia-700 hover:to-pink-700 shadow-xl hover:shadow-purple-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden"
        >
          {/* Shimmer overlay */}
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full hover:translate-x-full transition-transform duration-700 pointer-events-none" />
          <Rocket className={`w-6 h-6 ${launching ? 'animate-bounce' : ''}`} />
          <span>{launching ? 'Launching…' : 'Open in About:Blank'}</span>
        </motion.button>

        {/* Launcher page link */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Want a dedicated launcher page?{' '}
          <a
            href="/launch.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
          >
            Open launch page →
          </a>
        </p>

        {/* Feedback messages */}
        <AnimatePresence>
          {justEnabled && (
            <motion.div
              key="enabled"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
            >
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700/90 dark:text-green-300/90">
                Auto-cloak <strong>enabled</strong>. Next time you visit the site it will
                automatically open in an about:blank tab.
              </p>
            </motion.div>
          )}

          {popupBlocked && (
            <motion.div
              key="blocked"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700/90 dark:text-red-300/90">
                Popup blocked! Click the address-bar icon and choose{' '}
                <strong>&quot;Always allow popups&quot;</strong> for this site, then try again.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Browser compatibility note */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-700/90 dark:text-blue-300/90">
            💡 <strong>Tip:</strong> Works best in Chrome and Edge. Games, settings, and
            navigation all function normally inside the about:blank window.
          </p>
        </div>
      </div>
    </section>
  )
}
