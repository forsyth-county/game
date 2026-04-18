'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, ShieldAlert } from 'lucide-react'

export function AboutBlankToggle() {
  const [enabled, setEnabled] = useState(false)
  const [justEnabled, setJustEnabled] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEnabled(localStorage.getItem('forsyth-ab-cloak') === 'true')
    }
  }, [])

  const toggle = () => {
    const next = !enabled
    setEnabled(next)
    localStorage.setItem('forsyth-ab-cloak', String(next))

    if (next) {
      setJustEnabled(true)
    } else {
      setJustEnabled(false)
    }
  }

  const launchNow = () => {
    const url = new URL(window.location.origin)
    url.searchParams.set('__ab', '1')

    const popup = window.open('about:blank', '_blank')
    if (popup) {
      // Build the document using DOM APIs to avoid XSS from URL concatenation
      const doc = popup.document
      doc.open()
      doc.write(
        '<!DOCTYPE html><html lang="en"><head>' +
        '<meta charset="utf-8"/>' +
        '<meta name="viewport" content="width=device-width,initial-scale=1"/>' +
        '<title>Forsyth Educational Portal</title>' +
        '<style>html,body{margin:0;padding:0;height:100%;overflow:hidden;background:#000}</style>' +
        '</head><body></body></html>'
      )
      doc.close()

      // Create iframe via DOM API so the src is safely assigned
      const iframe = doc.createElement('iframe')
      iframe.src = url.href
      iframe.setAttribute('allow', 'fullscreen; autoplay; clipboard-write; encrypted-media')
      iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads allow-popups-to-escape-sandbox')
      iframe.allowFullscreen = true
      iframe.style.cssText = 'border:none;width:100%;height:100%;display:block'
      doc.body.appendChild(iframe)

      popup.focus()
    } else {
      alert(
        'Your browser blocked the popup. Please allow popups for this site and try again.'
      )
    }
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
          When enabled, visiting the site will automatically open it inside an{' '}
          <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-sm font-mono">
            about:blank
          </code>{' '}
          page. The address bar will show <strong>about:blank</strong> instead of the actual URL.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-slate-900 dark:text-white">
              Auto-cloak on visit
            </span>
          </div>
          <button
            onClick={toggle}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${
              enabled ? 'bg-purple-600' : 'bg-slate-600'
            }`}
            role="switch"
            aria-checked={enabled}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Launch Now Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={launchNow}
          className="w-full px-6 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
        >
          Open in About:Blank Now
        </motion.button>

        {/* Info / Just-enabled hint */}
        {justEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
          >
            <p className="text-sm text-green-700/90 dark:text-green-300/90">
              ✅ Auto-cloak enabled! Next time you visit the site, it will
              automatically open in an about:blank tab. You can also click the
              button above to launch immediately.
            </p>
          </motion.div>
        )}

        {/* Browser compatibility note */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-700/90 dark:text-blue-300/90">
            💡 <strong>Note:</strong> If your browser blocks the popup, click
            &quot;Allow popups&quot; in the address bar and try again. This feature works
            best in Chrome and Edge. All site features (games, settings,
            navigation) work normally inside the about:blank window.
          </p>
        </div>
      </div>
    </section>
  )
}
