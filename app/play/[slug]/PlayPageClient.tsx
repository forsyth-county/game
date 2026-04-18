'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Maximize, RefreshCw } from 'lucide-react'
import { games } from '@/data/games'
import { utilities } from '@/data/utilities'
import { Game, Utility } from '@/lib/types'
import { withBasePath } from '@/lib/utils'
import { trackGamePlay } from '@/lib/gameTracking'

interface PlayPageClientProps {
  slug: string
}

export default function PlayPageClient({ slug }: PlayPageClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState<Game | Utility | null>(null)

  const handleBack = () => {
    // When running inside the about:blank iframe (?__ab=1), window.history.back()
    // may have no prior entries to return to (the popup was opened fresh). In that
    // case navigate explicitly to the home page while keeping the __ab param so
    // AboutBlankGate stays in portal mode.
    const params = new URLSearchParams(window.location.search)
    if (params.get('__ab') === '1') {
      router.push('/?__ab=1')
    } else {
      router.back()
    }
  }

  useEffect(() => {
    // Find the game or utility
    const game = games.find(g => g.id === slug)
    const utility = utilities.find(u => u.id === slug)
    setItem(game || utility || null)
    
    // Track game play (only for games, not utilities)
    if (game) {
      trackGamePlay(game.id)
    }
  }, [slug])

  const handleFullscreen = () => {
    const iframe = document.querySelector('iframe')
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen()
      }
    }
  }

  const handleRefresh = () => {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement
    if (iframe) {
      iframe.src = iframe.src
    }
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-2xl text-muted-foreground">Item not found</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-primary text-black rounded-full font-semibold hover:scale-105 transition-transform"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="glass border-b border-border p-4 flex items-center gap-4 z-50"
      >
        <button
          onClick={handleBack}
          className="p-2 hover:bg-primary/10 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-primary" />
        </button>

        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{item.name}</h1>
          {'category' in item && (
            <p className="text-sm text-muted-foreground">{item.category}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-primary/10 rounded-full transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-muted-foreground hover:text-primary" />
          </button>
          <button
            onClick={handleFullscreen}
            className="p-2 hover:bg-primary/10 rounded-full transition-colors"
            aria-label="Fullscreen"
          >
            <Maximize className="w-5 h-5 text-muted-foreground hover:text-primary" />
          </button>
        </div>
      </motion.div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
            <p className="text-lg text-muted-foreground">Loading {item.name}...</p>
          </div>
        </div>
      )}

      {/* Iframe */}
      <div className="flex-1 relative">
        <iframe
          src={withBasePath(item.iframeSrc)}
          className="w-full h-full border-none game-iframe"
          onLoad={() => setLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-pointer-lock"
          allow="autoplay; fullscreen; picture-in-picture; gamepad; accelerometer; gyroscope"
          referrerPolicy="no-referrer-when-downgrade"
          loading="eager"
        />
      </div>
    </div>
  )
}
