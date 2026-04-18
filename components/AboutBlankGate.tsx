'use client'

import { useState, useEffect, useCallback, type ReactNode } from 'react'

/**
 * AboutBlankGate
 *
 * This component is the first thing rendered inside <body>. It checks whether
 * the current page was loaded inside an about:blank iframe (signalled by the
 * `__ab=1` query parameter). If **not**, it renders a fullscreen launcher page
 * with a single "Launch Portal" button and blocks all other content. If the
 * parameter **is** present, it renders children (the normal portal).
 *
 * On button click the component:
 * 1. Opens `window.open('about:blank', '_blank')` (must be inside click handler).
 * 2. Writes a minimal HTML document with a loading spinner and a full-page
 *    iframe pointing back at the current origin with `?__ab=1`.
 * 3. Fades out the launcher tab and navigates it to `about:blank`.
 *
 * If the popup is blocked, a clear error message is shown.
 */
export function AboutBlankGate({ children }: { children: ReactNode }) {
  // Start in a 'loading' state so no portal content flashes before we check
  // the query parameter on the client.
  const [mode, setMode] = useState<'loading' | 'launcher' | 'portal'>('loading')
  const [popupBlocked, setPopupBlocked] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('__ab') === '1') {
      setMode('portal')
    } else {
      setMode('launcher')
    }
  }, [])

  const launch = useCallback(() => {
    setPopupBlocked(false)
    setLaunching(true)

    // Build the target URL – always point at the origin root with __ab=1
    const target = new URL(window.location.origin)
    target.searchParams.set('__ab', '1')

    // Must open synchronously inside the click handler to avoid popup blockers
    const popup = window.open('about:blank', '_blank')

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      setPopupBlocked(true)
      setLaunching(false)
      return
    }

    // Write a minimal page with a loading spinner and an iframe into the popup
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
        '.spinner{width:48px;height:48px;border:3px solid rgba(0,238,255,.2);' +
          'border-top-color:#00eeff;border-radius:50%;animation:spin .8s linear infinite}' +
        '@keyframes spin{to{transform:rotate(360deg)}}' +
      '</style>' +
      '</head><body>' +
      '<div class="loader" id="loader"><div class="spinner"></div></div>' +
      '</body></html>'
    )
    doc.close()

    // Create iframe via DOM (avoids XSS from URL concatenation)
    const iframe = doc.createElement('iframe')
    iframe.src = target.href
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

    // Fade out the launcher tab, then navigate it away
    setFadingOut(true)
    setTimeout(() => {
      try {
        window.location.replace('about:blank')
      } catch {
        // Ignore – some browsers block this
      }
    }, 600)
  }, [])

  // ── Loading state: show a black screen to avoid content flash ──
  if (mode === 'loading') {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#020408',
          zIndex: 99999,
        }}
      />
    )
  }

  // ── Portal mode: render the normal site ──
  if (mode === 'portal') {
    return <>{children}</>
  }

  // ── Launcher mode: fullscreen launcher page ──
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#020408',
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        overflow: 'hidden',
        transition: 'opacity .5s ease',
        opacity: fadingOut ? 0 : 1,
      }}
    >
      {/* Animated grid background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(0,238,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,238,255,.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* Floating orbs */}
      <div
        style={{
          position: 'fixed',
          width: 500,
          height: 500,
          borderRadius: '50%',
          filter: 'blur(80px)',
          background: 'radial-gradient(circle, rgba(0,238,255,.15), transparent 70%)',
          top: -150,
          left: -150,
          pointerEvents: 'none',
          animation: 'abg-float 8s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'fixed',
          width: 400,
          height: 400,
          borderRadius: '50%',
          filter: 'blur(80px)',
          background: 'radial-gradient(circle, rgba(139,92,246,.18), transparent 70%)',
          bottom: -120,
          right: -120,
          pointerEvents: 'none',
          animation: 'abg-float 8s ease-in-out infinite 4s',
        }}
      />

      {/* Main content */}
      <main
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '2rem',
          textAlign: 'center',
          gap: '1.5rem',
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '.5rem',
            padding: '.45rem 1.1rem',
            borderRadius: 999,
            background: 'rgba(0,238,255,.08)',
            border: '1px solid rgba(0,238,255,.25)',
            color: '#00eeff',
            fontSize: '.8rem',
            fontWeight: 600,
            letterSpacing: '.06em',
            textTransform: 'uppercase' as const,
            animation: 'abg-fadeDown .6s ease both',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: 14, height: 14, fill: 'currentColor' }}
          >
            <path d="M12 2l2.93 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.07-1.01z" />
          </svg>
          Forsyth Educational Portal
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: 'clamp(2.4rem, 8vw, 5rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-.03em',
            color: '#fff',
            margin: 0,
            animation: 'abg-fadeDown .6s .12s ease both',
          }}
        >
          Your learning,
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #00eeff, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            your way.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(.95rem, 2.5vw, 1.2rem)',
            color: 'rgba(255,255,255,.5)',
            maxWidth: 480,
            lineHeight: 1.6,
            margin: 0,
            animation: 'abg-fadeDown .6s .22s ease both',
          }}
        >
          Click below to launch the portal inside a private tab.
          <br />
          The address bar will show{' '}
          <strong style={{ color: 'rgba(255,255,255,.7)' }}>about:blank</strong> —
          keeping your session discreet.
        </p>

        {/* Launch button */}
        <button
          onClick={launch}
          disabled={launching}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '.8rem',
            padding: '1.15rem 3rem',
            border: 'none',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, #00eeff, #8b5cf6)',
            color: '#050505',
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            fontWeight: 800,
            letterSpacing: '.02em',
            cursor: launching ? 'not-allowed' : 'pointer',
            opacity: launching ? 0.6 : 1,
            transition: 'transform .2s, box-shadow .2s, opacity .2s',
            animation: 'abg-fadeUp .6s .35s ease both',
          }}
          onMouseEnter={(e) => {
            if (!launching) {
              e.currentTarget.style.transform = 'scale(1.06)'
              e.currentTarget.style.boxShadow =
                '0 0 40px rgba(0,238,255,.45), 0 0 80px rgba(139,92,246,.25)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {/* Rocket icon */}
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: 22, height: 22, fill: 'currentColor', flexShrink: 0 }}
          >
            <path d="M13.13 22.19l-1.63-3.83c1.57-.58 3.04-1.36 4.37-2.33l-2.74 6.16zM5.64 12.5l-3.83-1.63 6.16-2.74c-.97 1.33-1.75 2.8-2.33 4.37zM17.45 2.3A16.05 16.05 0 0 0 2.3 17.45l4.27 4.27a1 1 0 0 0 1.41 0l9.88-9.88a1 1 0 0 0 0-1.41L17.45 2.3zM11 10a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
          </svg>
          <span>{launching ? 'Launching…' : 'Launch Portal'}</span>
        </button>

        {/* Hint */}
        <p
          style={{
            fontSize: '.78rem',
            color: 'rgba(255,255,255,.3)',
            margin: 0,
            animation: 'abg-fadeUp .6s .45s ease both',
          }}
        >
          Opens in a new about:blank tab &nbsp;·&nbsp; Allow popups if prompted
        </p>

        {/* Error banner */}
        {popupBlocked && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '.75rem',
              padding: '.9rem 1.4rem',
              borderRadius: '.75rem',
              background: 'rgba(239,68,68,.12)',
              border: '1px solid rgba(239,68,68,.3)',
              color: '#fca5a5',
              fontSize: '.88rem',
              maxWidth: 480,
              animation: 'abg-fadeDown .4s ease both',
            }}
          >
            {/* Warning icon */}
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: 18, height: 18, fill: 'currentColor', flexShrink: 0 }}
            >
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
            <span>
              Popup was blocked. Please allow popups for this site in your browser
              settings, then click <strong>Launch Portal</strong> again.
            </span>
          </div>
        )}
      </main>

      {/* Keyframe animations injected via a <style> tag */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes abg-float {
              0%, 100% { transform: translate(0, 0); }
              50% { transform: translate(30px, -30px); }
            }
            @keyframes abg-fadeDown {
              from { opacity: 0; transform: translateY(-18px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes abg-fadeUp {
              from { opacity: 0; transform: translateY(18px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `,
        }}
      />
    </div>
  )
}
