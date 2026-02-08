'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { Filter } from 'bad-words'

// Security constants
const MAX_NAME_LENGTH = 10
const VALID_CHARS_REGEX = /^[a-zA-Z\s\-']+$/
const MIN_NAME_LENGTH = 2
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 5 * 60 * 1000 // 5 minutes
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_ATTEMPTS_PER_WINDOW = 10

// Common profanity patterns to catch variations (removed global flag to prevent state issues)
const PROFANITY_PATTERNS = [
  /\b(f+u+c+k+)\b/i,
  /\b(s+h+i+t+)\b/i,
  /\b(a+s+s+)\b/i,
  /\b(d+a+m+n+)\b/i,
  /\b(h+e+l+l+)\b/i,
  /\b(b+i+t+c+h+)\b/i,
  /\b(c+u+n+t+)\b/i,
  /\b(p+i+s+s+)\b/i,
  // Leet speak variations
  /f[ux@]c[kk]/i,
  /5[h1][i1]t/i,
  /@[s$][s$]/i,
  // Character separation
  /f\s*u\s*c\s*k/i,
  /s\s*h\s*i\s*t/i,
]

interface UserContextType {
  userName: string | null
  setUserName: (name: string | null) => void
  clearUserName: () => void
  isLoaded: boolean
  error: string | null
  setError: (error: string | null) => void
  securityState: SecurityState
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// Single filter instance to avoid duplication
const filter = new Filter()

// Enhanced validation with multiple security layers
const validateName = (name: string): { isValid: boolean; error?: string; cleanName?: string; riskLevel?: 'low' | 'medium' | 'high' } => {
  const trimmedName = name.trim()
  
  // Length validation
  if (trimmedName.length < MIN_NAME_LENGTH) {
    return { isValid: false, error: `Name must be at least ${MIN_NAME_LENGTH} characters long`, riskLevel: 'low' }
  }
  
  if (trimmedName.length > MAX_NAME_LENGTH) {
    return { isValid: false, error: `Name must be ${MAX_NAME_LENGTH} characters or less`, riskLevel: 'low' }
  }
  
  // Character validation - strict check
  if (!VALID_CHARS_REGEX.test(trimmedName)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes', riskLevel: 'medium' }
  }
  
  // Check for repeated characters (potential spam/bypass attempts)
  if (/(.)\1{2,}/.test(trimmedName)) {
    return { isValid: false, error: 'Name cannot contain three or more repeated characters', riskLevel: 'medium' }
  }
  
  // Check for suspicious patterns
  if (/^[\s\-']+$/.test(trimmedName) || !/[a-zA-Z]/.test(trimmedName)) {
    return { isValid: false, error: 'Name must contain at least one letter', riskLevel: 'high' }
  }
  
  // Check for potential injection attempts
  if (/javascript:|<script|data:|vbscript:/i.test(trimmedName)) {
    return { isValid: false, error: 'Invalid name format', riskLevel: 'high' }
  }
  
  return { isValid: true, cleanName: trimmedName, riskLevel: 'low' }
}

// Enhanced profanity detection
const detectProfanity = (text: string): { isProfane: boolean; matchedPatterns?: string[] } => {
  const badWordsResult = filter.isProfane(text)
  const matchedPatterns: string[] = []
  
  // Check regex patterns efficiently without state issues
  for (const pattern of PROFANITY_PATTERNS) {
    // Use test with lastIndex reset to avoid global flag issues
    if (pattern.global) {
      pattern.lastIndex = 0
    }
    if (pattern.test(text)) {
      matchedPatterns.push(pattern.source)
    }
  }
  
  return {
    isProfane: badWordsResult || matchedPatterns.length > 0,
    matchedPatterns: matchedPatterns.length > 0 ? matchedPatterns : undefined
  }
}

// Security monitoring interface
interface SecurityState {
  attempts: number
  lastAttempt: number
  attemptsInWindow: number
  windowStart: number
  isLocked: boolean
  lockUntil: number
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [userName, setUserNameState] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [securityState, setSecurityState] = useState<SecurityState>({
    attempts: 0,
    lastAttempt: 0,
    attemptsInWindow: 0,
    windowStart: Date.now(),
    isLocked: false,
    lockUntil: 0
  })
  
  // Consolidated rate limiting and lock management
  const checkAndUpdateRateLimit = useCallback((isFailedAttempt: boolean = false): { shouldBlock: boolean; lockMessage?: string } => {
    const now = Date.now()
    let result: { shouldBlock: boolean; lockMessage?: string } = { shouldBlock: false }
    
    setSecurityState(currentState => {
      let newState = { ...currentState }
      
      // Check if currently locked
      if (currentState.isLocked && now < currentState.lockUntil) {
        const remainingTime = Math.ceil((currentState.lockUntil - now) / 1000)
        result = {
          shouldBlock: true,
          lockMessage: `Too many attempts. Try again in ${remainingTime} seconds.`
        }
        return currentState
      }
      
      // Reset lock if expired
      if (currentState.isLocked && now >= currentState.lockUntil) {
        newState.isLocked = false
        newState.attempts = 0
        newState.attemptsInWindow = 0
        newState.windowStart = now
      }
      
      // Check rate limit window
      if (now - newState.windowStart > RATE_LIMIT_WINDOW) {
        newState.attemptsInWindow = 0
        newState.windowStart = now
      }
      
      // Update attempt counts for failed attempts
      if (isFailedAttempt) {
        newState.attempts++
        newState.attemptsInWindow++
        newState.lastAttempt = now
      }
      
      // Check if exceeded rate limit and apply lock
      if (newState.attemptsInWindow >= MAX_ATTEMPTS_PER_WINDOW || newState.attempts >= MAX_ATTEMPTS) {
        newState.isLocked = true
        newState.lockUntil = now + LOCKOUT_DURATION
        const remainingTime = Math.ceil(LOCKOUT_DURATION / 1000)
        result = {
          shouldBlock: true,
          lockMessage: `Too many attempts. Try again in ${remainingTime} seconds.`
        }
      }
      
      return newState
    })
    
    return result
  }, [])
  
  const resetAttempts = useCallback(() => {
    setSecurityState(prev => ({
      ...prev,
      attempts: 0,
      attemptsInWindow: 0
    }))
  }, [])
  
  useEffect(() => {
    try {
      // Check if localStorage is available
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage is not available')
        setIsLoaded(true)
        return
      }
      
      const storedName = localStorage.getItem('forsyth-user-name')
      if (storedName) {
        // Check for profanity first
        const profanityCheck = detectProfanity(storedName)
        if (profanityCheck.isProfane) {
          setError('Invalid name format')
          try {
            localStorage.removeItem('forsyth-user-name')
          } catch (removeError) {
            console.warn('Failed to remove invalid name from localStorage:', removeError)
          }
        } else {
          const validation = validateName(storedName)
          if (validation.isValid && validation.cleanName) {
            setUserNameState(validation.cleanName)
          } else {
            setError(validation.error || 'Invalid name format')
            // Remove invalid name from storage
            try {
              localStorage.removeItem('forsyth-user-name')
            } catch (removeError) {
              console.warn('Failed to remove invalid name from localStorage:', removeError)
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to read user name from localStorage:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const setUserName = useCallback((name: string | null) => {
    // Check rate limiting first
    const rateLimitResult = checkAndUpdateRateLimit(false)
    if (rateLimitResult.shouldBlock) {
      setError(rateLimitResult.lockMessage || 'Too many attempts. Try again later.')
      return
    }
    
    try {
      if (name && name.trim()) {
        const trimmedName = name.trim()
        
        // Enhanced profanity detection
        const profanityCheck = detectProfanity(trimmedName)
        if (profanityCheck.isProfane) {
          setError('Please enter a name without inappropriate language.')
          checkAndUpdateRateLimit(true) // Record failed attempt
          return
        }
        
        // Enhanced validation
        const validation = validateName(trimmedName)
        
        if (!validation.isValid) {
          setError(validation.error || 'Invalid name format')
          checkAndUpdateRateLimit(true) // Record failed attempt
          return
        }
        
        // Additional security checks for high-risk inputs
        if (validation.riskLevel === 'high') {
          console.warn('High-risk name input detected')
          setError('Invalid name format')
          checkAndUpdateRateLimit(true) // Record failed attempt
          return
        }
        
        // Store valid name
        const cleanName = validation.cleanName || trimmedName
        
        // Safe localStorage operations with error handling
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('forsyth-user-name', cleanName)
          }
        } catch (storageError) {
          console.warn('Failed to save to localStorage:', storageError)
          setError('Name saved but storage is unavailable')
        }
        
        setUserNameState(cleanName)
        setError(null)
        resetAttempts() // Reset on success
      } else {
        // Clear name
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('forsyth-user-name')
          }
        } catch (storageError) {
          console.warn('Failed to clear localStorage:', storageError)
        }
        setUserNameState(null)
        setError(null)
      }
    } catch (error) {
      console.error('Failed to save user name:', error)
      setError('Failed to save name')
      checkAndUpdateRateLimit(true) // Record failed attempt
    }
  }, [checkAndUpdateRateLimit, resetAttempts, setError])

  const clearUserName = useCallback(() => {
    try {
      setUserNameState(null)
      setError(null)
      
      // Reset security state when clearing name
      setSecurityState({
        attempts: 0,
        lastAttempt: 0,
        attemptsInWindow: 0,
        windowStart: Date.now(),
        isLocked: false,
        lockUntil: 0
      })
      
      // Safe localStorage operations with error handling
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('forsyth-user-name')
        }
      } catch (storageError) {
        console.warn('Failed to clear localStorage:', storageError)
        setError('Failed to clear name from storage. Please try again.')
      }
    } catch (error) {
      console.warn('Failed to clear user name:', error)
      setError('Failed to clear name. Please try again.')
    }
  }, [setError])

  return (
    <UserContext.Provider value={{ userName, setUserName, clearUserName, isLoaded, error, setError, securityState }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
