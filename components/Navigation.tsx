'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Hexagon, Dices } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { games } from '@/data/games'

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Games', href: '/games' },
  { name: 'Settings', href: '/settings' },
]

const SCROLL_TOP_THRESHOLD = 10
const SCROLL_HIDE_THRESHOLD = 100

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isRandomizing, setIsRandomizing] = useState(false)

  // Hide navbar on /play routes
  const isPlayPage = pathname?.startsWith('/play/')

  useEffect(() => {
    if (isPlayPage) return // Don't attach scroll listener on play pages

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Show navbar when scrolling up or at top, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < SCROLL_TOP_THRESHOLD) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > SCROLL_HIDE_THRESHOLD) {
        setIsVisible(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, isPlayPage])

  const playRandom = () => {
    setIsRandomizing(true)
    
    // Pick any random game from ALL available games
    const randomGame = games[Math.floor(Math.random() * games.length)]
    setTimeout(() => {
      router.push(`/play/${randomGame.id}`)
    }, 300)
  }

  // Don't render navbar on play pages
  if (isPlayPage) return null

  return (
    <>
      {/* Desktop Navigation */}
      <nav 
        className={cn(
          "fixed top-6 left-1/2 -translate-x-1/2 z-50 hidden md:block transition-all duration-300",
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-24 opacity-0"
        )}
      >
        <div className="glass border border-border rounded-full px-8 py-3 shadow-2xl">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
              <Hexagon className="w-6 h-6" />
              <span className="font-bold text-lg">Forsyth</span>
            </Link>
            
            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-all duration-200 hover:text-primary',
                    pathname === item.href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <button
              onClick={playRandom}
              disabled={isRandomizing}
              className="group relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-full font-semibold text-sm text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow"
            >
              <Dices className={`w-4 h-4 ${isRandomizing ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform`} />
              <span>Bored?</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 md:hidden transition-all duration-300",
          isVisible ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="glass border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-primary">
              <Hexagon className="w-6 h-6" />
              <span className="font-bold text-lg">Forsyth</span>
            </Link>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed left-0 top-0 bottom-0 w-64 glass border-r border-border z-50 md:hidden"
            >
              <div className="p-6">
                <Link 
                  href="/" 
                  className="flex items-center gap-2 text-primary mb-8"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Hexagon className="w-8 h-8" />
                  <span className="font-bold text-xl">Forsyth Games</span>
                </Link>
                
                <div className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'text-lg font-medium transition-all duration-200 hover:text-primary py-2 px-4 rounded-lg',
                        pathname === item.href
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      playRandom()
                    }}
                    disabled={isRandomizing}
                    className="group relative inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-xl font-semibold text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow"
                  >
                    <Dices className={`w-5 h-5 ${isRandomizing ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform`} />
                    <span>Bored?</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
