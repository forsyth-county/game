'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'
import { createSolidColorFavicon, CLOAK_OPTIONS } from '@/lib/tabCloakUtils'

const CLOAK_COOLDOWN_MS = 3000 // 3 seconds

// Helper function for fallback emojis
const getFallbackEmoji = (id: string): string => {
  switch (id) {
    case 'google-drive': return '📁'
    case 'canvas': return '🎨'
    case 'classlink': return '🎓'
    case 'linewize': return '🛡️'
    case 'infinite-campus': return '🏫'
    default: return '🌐'
  }
}

// Helper to remove all cloak classes from body
const removeCloakClasses = () => {
  CLOAK_OPTIONS.forEach(option => {
    document.body.classList.remove(option.cssClass)
  })
}

export function TabCloak() {
  const [selectedCloak, setSelectedCloak] = useState<string>('none')
  const [cooldownRemaining, setCooldownRemaining] = useState(0)

  useEffect(() => {
    // Load saved cloak on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('forsyth-tab-cloak')
      if (saved && saved !== 'none') {
        setSelectedCloak(saved)
      }
    }
  }, [])

  const applyCloak = (cloakId: string) => {
    // Ensure we're in a browser environment
    if (typeof window === 'undefined') return
    
    // Check rate limit
    const lastChange = localStorage.getItem('forsyth-cloak-last-change')
    if (lastChange) {
      const timeSinceChange = Date.now() - parseInt(lastChange)
      if (timeSinceChange < CLOAK_COOLDOWN_MS) {
        const remaining = Math.ceil((CLOAK_COOLDOWN_MS - timeSinceChange) / 1000)
        setCooldownRemaining(remaining)
        
        // Start countdown
        const interval = setInterval(() => {
          setCooldownRemaining(prev => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
        
        return
      }
    }
    
    setSelectedCloak(cloakId)
    
    if (cloakId === 'none') {
      // Reset to default
      document.title = 'Forsyth Games Portal'
      const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement
      if (favicon) {
        favicon.href = 'https://site.imsglobal.org/sites/default/files/orgs/logos/primary/fcslogo_hexagon.png'
      }
      // Remove all cloak CSS classes
      removeCloakClasses()
      localStorage.removeItem('forsyth-tab-cloak')
      localStorage.removeItem('forsyth-bg-color') // Clean up legacy key
      localStorage.setItem('forsyth-cloak-last-change', Date.now().toString())
    } else {
      const option = CLOAK_OPTIONS.find(o => o.id === cloakId)
      if (option) {
        document.title = option.title
        
        // Update favicon with solid color matching background
        let favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement
        if (!favicon) {
          favicon = document.createElement('link')
          favicon.rel = 'icon'
          document.head.appendChild(favicon)
        }
        favicon.href = createSolidColorFavicon(option.bgColor)
        
        // Remove existing cloak classes and add new one
        removeCloakClasses()
        document.body.classList.add(option.cssClass)
        
        // Save to localStorage
        localStorage.setItem('forsyth-tab-cloak', cloakId)
        localStorage.setItem('forsyth-cloak-last-change', Date.now().toString())
      }
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-8 lg:p-10 space-y-6">
        {/* Section Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
            <Globe className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Change Theme</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Customize your tab with educational preset colors</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          Personalize your experience:
        </p>

        {/* Cooldown Message */}
        {cooldownRemaining > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20"
          >
            <p className="text-sm text-yellow-600/90 dark:text-yellow-300/90 text-center">
              ⏱️ Please wait {cooldownRemaining} second{cooldownRemaining !== 1 ? 's' : ''} before changing cloak again.
            </p>
          </motion.div>
        )}

        {/* Preset Cards - Horizontal Scroll */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Choose Your Theme</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Default Option */}
            <button
              onClick={() => applyCloak('none')}
              disabled={cooldownRemaining > 0}
              className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 text-left group ${
                selectedCloak === 'none'
                  ? 'border-blue-500 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 shadow-lg shadow-blue-500/20 scale-105'
                  : 'border-slate-300/50 dark:border-slate-600/50 hover:border-blue-500/50 hover:bg-slate-100/50 dark:hover:bg-slate-700/30 hover:scale-102'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {/* Background Preview */}
              <div className="h-24 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative">
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='rgba(0,0,0,0.05)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`
                }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Globe className="w-8 h-8 text-blue-500 opacity-50" />
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 dark:text-white">Default</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Forsyth Portal</div>
                  </div>
                </div>
                {selectedCloak === 'none' && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-500/10 rounded-lg px-2 py-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>Currently Active</span>
                  </div>
                )}
              </div>
            </button>

            {/* Cloak Options */}
            {CLOAK_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => applyCloak(option.id)}
                disabled={cooldownRemaining > 0}
                className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 text-left group ${
                  selectedCloak === option.id
                    ? 'border-blue-500 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 shadow-lg shadow-blue-500/20 scale-105'
                    : 'border-slate-300/50 dark:border-slate-600/50 hover:border-blue-500/50 hover:bg-slate-100/50 dark:hover:bg-slate-700/30 hover:scale-102'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {/* Enhanced Background Preview */}
                <div 
                  className="h-24 relative transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: option.bgColor }}
                >
                  {/* Add subtle pattern overlay */}
                  <div className="absolute inset-0 opacity-50" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`
                  }} />
                  
                  {/* Theme Logo as Main Element */}
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    {option.logoUrl ? (
                      <img 
                        src={option.logoUrl} 
                        alt={`${option.name} logo`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="text-4xl">${getFallbackEmoji(option.id)}</div>`;
                          }
                        }}
                      />
                    ) : (
                      <div className="text-4xl">{getFallbackEmoji(option.id)}</div>
                    )}
                  </div>
                  
                  {/* Color indicator */}
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full border-2 border-white/30 shadow-lg" style={{ backgroundColor: option.bgColor }} />
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl border-2 border-white/20 shadow-md transition-transform group-hover:scale-110"
                      style={{ backgroundColor: option.bgColor }}
                    />
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 dark:text-white">{option.name}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 truncate">{option.title}</div>
                    </div>
                  </div>
                  {selectedCloak === option.id && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-500/10 rounded-lg px-2 py-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span>Currently Active</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

    {/* Info Note */}
<div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
  <p className="text-sm text-blue-700/90 dark:text-blue-300/90">
    💡 | The theme applies immediately.
  </p>
</div>

      </div>
    </section>
  )
}
