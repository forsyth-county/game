'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function MouseGradient() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()

  // Only show on main page (root path)
  const shouldShow = pathname && pathname === '/'

  useEffect(() => {
    // Only set up listeners if we're on the main page
    if (!shouldShow) return

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    // Add event listeners
    window.addEventListener('mousemove', updateMousePosition)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)

    // Set initial visibility
    setIsVisible(true)

    return () => {
      window.removeEventListener('mousemove', updateMousePosition)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [shouldShow])

  if (!isVisible || !shouldShow) return null

  return (
    <>
      {/* Main gradient circle */}
      <div
        className="pointer-events-none fixed z-50 transition-transform duration-100 ease-out"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div 
          className="w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.2) 30%, rgba(236, 72, 153, 0.1) 60%, transparent 100%)',
            filter: 'blur(40px)'
          }}
        />
      </div>

      {/* Secondary smaller gradient for more depth */}
      <div
        className="pointer-events-none fixed z-40 transition-transform duration-75 ease-out"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div 
          className="w-48 h-48 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(147, 51, 234, 0.3) 40%, transparent 70%)',
            filter: 'blur(20px)'
          }}
        />
      </div>

      {/* Inner core gradient */}
      <div
        className="pointer-events-none fixed z-30 transition-transform duration-50 ease-out"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div 
          className="w-24 h-24 rounded-full opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(147, 51, 234, 0.4) 50%, transparent 100%)',
            filter: 'blur(10px)'
          }}
        />
      </div>

      {/* Center bright spot */}
      <div
        className="pointer-events-none fixed z-20 transition-transform duration-0 ease-out"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div 
          className="w-8 h-8 rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(59, 130, 246, 0.6) 30%, transparent 70%)',
            filter: 'blur(2px)'
          }}
        />
      </div>
    </>
  )
}
