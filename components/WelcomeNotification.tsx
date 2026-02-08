'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export function WelcomeNotification() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already seen the notification in this session
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome')
    
    if (!hasSeenWelcome) {
      // Show notification after a short delay
      const showTimer = setTimeout(() => {
        setIsVisible(true)
        sessionStorage.setItem('hasSeenWelcome', 'true')
        
        // Auto-hide after 3 seconds
        const hideTimer = setTimeout(() => {
          setIsVisible(false)
        }, 3000)
        
        return () => clearTimeout(hideTimer)
      }, 1000)
      
      return () => clearTimeout(showTimer)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
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
              
              <div className="relative flex items-center justify-between gap-2 xs:gap-3 sm:gap-4">
                <div className="flex items-center gap-2 xs:gap-3">
                  {/* Enhanced avatar with glow */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                    <div className="relative w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center ring-2 ring-white/20">
                      <span className="text-sm xs:text-lg">👋</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm xs:text-base sm:text-lg font-bold text-foreground bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      Hello!
                    </h3>
                    <p className="text-xs xs:text-sm text-muted-foreground/80">Good to see you again</p>
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
              
              {/* Progress bar for auto-hide */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-secondary to-primary opacity-50"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
