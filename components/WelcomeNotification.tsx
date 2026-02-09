'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { X, Share2, Check } from 'lucide-react'

export function WelcomeNotification() {
  const [isVisible, setIsVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Check if user has already seen the notification in this session
    const hasSeenShare = sessionStorage.getItem('hasSeenShare')
    
    if (!hasSeenShare) {
      // Show notification after a short delay
      const showTimer = setTimeout(() => {
        setIsVisible(true)
        sessionStorage.setItem('hasSeenShare', 'true')
      }, 1000)
      
      return () => clearTimeout(showTimer)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-4 right-4 z-50 xs:top-6 xs:right-6 sm:top-8 sm:right-8"
        >
          <div className="relative group">
            {/* Glass effect with backdrop blur and gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-xl xs:rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Main content with enhanced glass */}
            <div className="relative glass rounded-xl xs:rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl p-3 xs:p-4 sm:p-6 w-64 xs:w-72 sm:w-80 md:min-w-[320px] md:max-w-md bg-white/5 dark:bg-black/20">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-xl xs:rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between gap-2 xs:gap-3 sm:gap-4 mb-3">
                  <div className="flex items-center gap-2 xs:gap-3">
                    {/* Enhanced avatar with glow */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                      <div className="relative w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center ring-2 ring-white/20">
                        <Share2 className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm xs:text-base sm:text-lg font-bold text-foreground bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        Share with Friends!
                      </h3>
                      <p className="text-xs xs:text-sm text-muted-foreground/80">Share this site with your friends</p>
                    </div>
                  </div>
                  
                  {/* Enhanced close button */}
                  <button
                    onClick={handleClose}
                    className="relative p-1.5 xs:p-2 rounded-xl hover:bg-white/10 dark:hover:bg-black/20 transition-all duration-200 group/close"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl opacity-0 group-hover/close:opacity-100 transition-opacity duration-200"></div>
                    <X className="relative w-3 h-3 xs:w-4 xs:h-4 text-muted-foreground group-hover/close:text-foreground transition-colors duration-200" />
                  </button>
                </div>
                
                {/* Copy button */}
                <button
                  onClick={handleCopy}
                  disabled={copied}
                  className="w-full relative p-2.5 xs:p-3 rounded-lg bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-200 group/copy disabled:opacity-75"
                >
                  <div className="flex items-center justify-center gap-2">
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span className="text-xs xs:text-sm font-semibold text-white">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 text-white" />
                        <span className="text-xs xs:text-sm font-semibold text-white">Copy Link</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
