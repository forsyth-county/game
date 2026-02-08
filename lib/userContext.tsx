'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Filter } from 'bad-words'

interface UserContextType {
  userName: string | null
  setUserName: (name: string | null) => void
  clearUserName: () => void
  isLoaded: boolean
  error: string | null
  setError: (error: string | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const filter = new Filter()

// Name validation constants
const MAX_NAME_LENGTH = 10
const VALID_CHARS_REGEX = /^[a-zA-Z\s\-']+$/
const CLEAN_REGEX = /[^a-zA-Z\s\-']/g

// Validate and clean name
const validateName = (name: string): { isValid: boolean; error?: string; cleanName?: string } => {
  // Remove all invalid characters (numbers, emojis, special chars)
  const cleanName = name.replace(CLEAN_REGEX, '').trim()
  
  // Check if empty after cleaning
  if (!cleanName) {
    return { isValid: false, error: 'Name must contain at least one letter' }
  }
  
  // Check length
  if (cleanName.length > MAX_NAME_LENGTH) {
    return { isValid: false, error: `Name must be ${MAX_NAME_LENGTH} characters or less` }
  }
  
  // Check for valid characters only (letters, spaces, hyphens, apostrophes)
  if (!VALID_CHARS_REGEX.test(cleanName)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' }
  }
  
  // Check if it's just spaces or special chars
  if (!/[a-zA-Z]/.test(cleanName)) {
    return { isValid: false, error: 'Name must contain at least one letter' }
  }
  
  return { isValid: true, cleanName }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [userName, setUserNameState] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load name from localStorage on mount
  useEffect(() => {
    try {
      const storedName = localStorage.getItem('forsyth-user-name')
      if (storedName) {
        const validation = validateName(storedName)
        if (validation.isValid && validation.cleanName) {
          setUserNameState(validation.cleanName)
        } else {
          setError(validation.error || 'Invalid name format')
          // Remove invalid name from storage
          localStorage.removeItem('forsyth-user-name')
        }
      }
    } catch (error) {
      console.warn('Failed to read user name from localStorage:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const setUserName = (name: string | null) => {
    try {
      if (name && name.trim()) {
        const trimmedName = name.trim()
        const validation = validateName(trimmedName)
        
        if (!validation.isValid) {
          setError(validation.error || 'Invalid name format')
          return
        }
        
        // Only store valid names
        const cleanName = validation.cleanName || trimmedName
        localStorage.setItem('forsyth-user-name', cleanName)
        setUserNameState(cleanName)
        setError(null)
      } else {
        // Clear name
        localStorage.removeItem('forsyth-user-name')
        setUserNameState(null)
        setError(null)
      }
    } catch (error) {
      console.error('Failed to save user name:', error)
      setError('Failed to save name')
    }
  }

  const clearUserName = () => {
    try {
      setUserNameState(null)
      localStorage.removeItem('forsyth-user-name')
      setError(null)
    } catch (error) {
      console.warn('Failed to clear user name from localStorage:', error)
      setError('Failed to clear name. Please try again.')
    }
  }

  return (
    <UserContext.Provider value={{ userName, setUserName, clearUserName, isLoaded, error, setError }}>
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
