'use client'

import { useState, useEffect } from 'react'

// Simple CSRF token generator for client-side use
export function useCSRFToken() {
  const [token, setToken] = useState<string>('')
  
  useEffect(() => {
    // Generate a random token on component mount
    const generateToken = () => {
      const array = new Uint8Array(32)
      crypto.getRandomValues(array)
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    }
    
    const newToken = generateToken()
    setToken(newToken)
    
    // Store token in sessionStorage for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('csrf-token', newToken)
    }
  }, [])
  
  const validateToken = (providedToken: string): boolean => {
    if (typeof window === 'undefined') return false
    
    const storedToken = sessionStorage.getItem('csrf-token')
    return storedToken === providedToken && token === providedToken
  }
  
  return { token, validateToken }
}

// Rate limiting hook for form submissions
export function useFormRateLimit(maxAttempts: number = 5, windowMs: number = 60000) {
  const [attempts, setAttempts] = useState<number[]>([])
  
  const isRateLimited = (): boolean => {
    const now = Date.now()
    const recentAttempts = attempts.filter(time => now - time < windowMs)
    return recentAttempts.length >= maxAttempts
  }
  
  const recordAttempt = (): boolean => {
    if (isRateLimited()) return false
    
    const now = Date.now()
    setAttempts(prev => [...prev.filter(time => now - time < windowMs), now])
    return true
  }
  
  const resetAttempts = () => {
    setAttempts([])
  }
  
  return { isRateLimited, recordAttempt, resetAttempts }
}
