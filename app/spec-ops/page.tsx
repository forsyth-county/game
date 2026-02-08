'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Lock, Send, Trash2, Bell, CheckCircle, AlertTriangle, School, BarChart3, Users, Wifi, WifiOff, Eye, TrendingUp, Calendar } from 'lucide-react'
import { SecurityUtils } from '@/lib/security'
import { adminAnnouncementService } from '@/lib/adminAnnouncementService'
import type { AnnouncementData } from '@/lib/announcementService'

// SHA-256 hash of '1140'
const ADMIN_PASSCODE_HASH = 'bc10b57514d76124b4120a34db2224067fed660b09408ade0b14b582946ff2fc'
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const MAX_LOGIN_ATTEMPTS = 3 // Maximum failed attempts
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes lockout
// Removed IP whitelist to allow access from anywhere

// Forsyth County High Schools
const FORSYTH_SCHOOLS = [
  'South Forsyth High School',
  'Lambert High School',
  'Forsyth Central High School',
  'West Forsyth High School',
  'North Forsyth High School',
  'Denmark High School',
  'Alliance Academy',
  'Pinecrest Academy'
]

// Real visitor stats interface
interface VisitorStats {
  today: {
    uniqueVisitors: number
    totalVisits: number
    date: string
  }
  last7Days: Array<{
    date: string
    uniqueVisitors: number
    totalVisits: number
  }>
  overall: {
    uniqueVisitors: number
    totalVisits: number
    startDate: string
  }
}



export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passcode, setPasscode] = useState('')
  const [passcodeError, setPasscodeError] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const [announcementType, setAnnouncementType] = useState<'info' | 'warning' | 'success'>('info')
  const [currentAnnouncement, setCurrentAnnouncement] = useState<AnnouncementData | null>(null)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastAnnouncementTime, setLastAnnouncementTime] = useState<number>(0)
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number>(0)

  const [sessionStartTime] = useState(Date.now())
  
  // Security state
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLockedOut, setIsLockedOut] = useState(false)
  const [lockoutEndTime, setLockoutEndTime] = useState(0)
  const [userIP, setUserIP] = useState('')
  const [userLocation, setUserLocation] = useState('')
  const [isSecureConnection, setIsSecureConnection] = useState(false)

  // Analytics state
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)

  // Fetch real visitor analytics from backend
  useEffect(() => {
    if (!isAuthenticated) return
    
    const fetchVisitorStats = async () => {
      try {
        const response = await fetch('https://portal-t795.onrender.com/api/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch visitor stats')
        }
        const data = await response.json()
        setVisitorStats(data.stats)
        setAnalyticsError(null)
      } catch (err) {
        setAnalyticsError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Failed to fetch visitor stats:', err)
      }
    }

    fetchVisitorStats()
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchVisitorStats, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Update rate limit countdown every second
  useEffect(() => {
    if (lastAnnouncementTime === 0) return
    
    const updateRateLimit = () => {
      const now = Date.now()
      const timeSinceLastAnnouncement = now - lastAnnouncementTime
      const remaining = Math.max(0, 60 * 1000 - timeSinceLastAnnouncement) // 1 minute in ms
      
      setRateLimitRemaining(remaining)
      
      if (remaining === 0) {
        setLastAnnouncementTime(0)
      }
    }
    
    const interval = setInterval(updateRateLimit, 1000) // Update every second
    return () => clearInterval(interval)
  }, [lastAnnouncementTime])

  useEffect(() => {
    // Security checks
    const performSecurityChecks = async () => {
      // Check for secure connection (HTTPS in production) - but allow access from anywhere
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost'
      setIsSecureConnection(isSecure)

      // Get user IP and location (client-side approximation)
      try {
        const [ipResponse, locationResponse] = await Promise.allSettled([
          fetch('https://api.ipify.org?format=json'),
          fetch('https://ipinfo.io/json')
        ])
        
        if (ipResponse.status === 'fulfilled') {
          const ipData = await ipResponse.value.json()
          setUserIP(ipData.ip || 'Unknown')
        }
        
        if (locationResponse.status === 'fulfilled') {
          const locationData = await locationResponse.value.json()
          setUserLocation(`${locationData.city}, ${locationData.country_name}` || 'Unknown')
        }
      } catch {
        setUserIP(window.location.hostname)
        setUserLocation('Unknown')
      }

      // Check lockout status
      const lockoutEnd = parseInt(localStorage.getItem('forsyth-admin-lockout') || '0')
      if (Date.now() < lockoutEnd) {
        setIsLockedOut(true)
        setLockoutEndTime(lockoutEnd)
        return
      }

      // Check if already authenticated this session
      const authSession = sessionStorage.getItem('forsyth-admin-auth')
      const sessionTime = sessionStorage.getItem('forsyth-admin-time')
      
      if (authSession === 'true' && sessionTime) {
        const sessionAge = Date.now() - parseInt(sessionTime)
        if (sessionAge < SESSION_TIMEOUT) {
          setIsAuthenticated(true)
        } else {
          // Session expired
          sessionStorage.removeItem('forsyth-admin-auth')
          sessionStorage.removeItem('forsyth-admin-time')
        }
      }

      // Check login attempts
      const attempts = parseInt(localStorage.getItem('forsyth-admin-attempts') || '0')
      setLoginAttempts(attempts)
    }

    performSecurityChecks()

    // Load current announcement and check backend health
    const loadCurrentAnnouncement = async () => {
      try {
        const [announcement, backendHealth] = await Promise.allSettled([
          adminAnnouncementService.getCurrentAnnouncement(),
          adminAnnouncementService.checkBackendHealth()
        ])
        
        if (announcement.status === 'fulfilled') {
          setCurrentAnnouncement(announcement.value)
        }
        
        if (backendHealth.status === 'fulfilled') {
          setIsBackendOnline(backendHealth.value)
        }
      } catch {
        // Ignore errors for now
      }
    }
    
    // Check if API key is configured
    const apiKeyConfigured = adminAnnouncementService.isApiKeyConfigured()
    if (!apiKeyConfigured) {
      console.warn('Admin API key is not configured')
    }
    
    loadCurrentAnnouncement()
    
    // Refresh announcement status every 30 seconds
    const refreshInterval = setInterval(loadCurrentAnnouncement, 30000)

    // Check for session timeout
    const checkSession = setInterval(() => {
      if (isAuthenticated) {
        const currentTime = Date.now()
        if (currentTime - sessionStartTime >= SESSION_TIMEOUT) {
          setIsAuthenticated(false)
          sessionStorage.removeItem('forsyth-admin-auth')
          sessionStorage.removeItem('forsyth-admin-time')
        }
      }
    }, 60000) // Check every minute

    return () => {
      clearInterval(checkSession)
      clearInterval(refreshInterval)
    }
  }, [isAuthenticated, sessionStartTime])

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if locked out
    if (isLockedOut) {
      setPasscodeError(`Account locked. Try again in ${Math.ceil((lockoutEndTime - Date.now()) / 60000)} minutes.`)
      return
    }

    // Check for secure connection in production (but allow access from anywhere)
    // Note: In production, you might want to enforce HTTPS, but for now we allow any connection

    // Rate limiting check
    const newAttempts = loginAttempts + 1
    setLoginAttempts(newAttempts)
    localStorage.setItem('forsyth-admin-attempts', newAttempts.toString())

    // Hash the input passcode and compare with stored hash
    const passcodeHash = await SecurityUtils.hashPassword(passcode)
    
    if (passcodeHash === ADMIN_PASSCODE_HASH) {
      // Successful login
      setIsAuthenticated(true)
      sessionStorage.setItem('forsyth-admin-auth', 'true')
      sessionStorage.setItem('forsyth-admin-time', Date.now().toString())
      setPasscodeError('')
      setLoginAttempts(0)
      localStorage.removeItem('forsyth-admin-attempts')
      
      // Log successful login attempt (in production, send to security monitoring)
      console.log('Admin login successful from:', userIP)
    } else {
      // Failed login
      const remainingAttempts = MAX_LOGIN_ATTEMPTS - newAttempts
      
      if (remainingAttempts <= 0) {
        // Lockout the user
        const lockoutEnd = Date.now() + LOCKOUT_DURATION
        setIsLockedOut(true)
        setLockoutEndTime(lockoutEnd)
        localStorage.setItem('forsyth-admin-lockout', lockoutEnd.toString())
        setPasscodeError(`Too many failed attempts. Account locked for ${LOCKOUT_DURATION / 60000} minutes.`)
        
        // Log security breach attempt
        console.warn('Admin lockout triggered from:', userIP)
      } else {
        setPasscodeError(`Incorrect passcode. ${remainingAttempts} attempts remaining.`)
      }
      
      setPasscode('')
    }
  }

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!announcement.trim()) return

    // Check rate limit
    const now = Date.now()
    const timeSinceLastAnnouncement = now - lastAnnouncementTime
    if (timeSinceLastAnnouncement < 60 * 1000) { // Less than 1 minute
      setSubmitStatus('error')
      const remainingSeconds = Math.ceil((60 * 1000 - timeSinceLastAnnouncement) / 1000)
      setSubmitMessage(`Rate limit: Please wait ${remainingSeconds} seconds before creating another announcement.`)
      return
    }

    // Check if API key is configured
    if (!adminAnnouncementService.isApiKeyConfigured()) {
      setSubmitStatus('error')
      setSubmitMessage('Admin API key is not configured. Please check your environment variables.')
      return
    }

    setIsLoading(true)
    setSubmitStatus('idle')
    
    const result = await adminAnnouncementService.createAnnouncement(
      announcement.trim(),
      announcementType,
      true
    )
    
    if (result.success) {
      setSubmitStatus('success')
      setSubmitMessage('Announcement broadcasted successfully! It will appear for all users in real-time.')
      setAnnouncement('')
      setLastAnnouncementTime(now) // Set rate limit timer
      setRateLimitRemaining(60 * 1000) // Reset countdown
      
      // Refresh current announcement
      const updated = await adminAnnouncementService.getCurrentAnnouncement()
      setCurrentAnnouncement(updated)
    } else {
      setSubmitStatus('error')
      setSubmitMessage(`Failed to broadcast announcement: ${result.error}`)
    }
    
    setIsLoading(false)
  }

  




  const clearAnnouncement = async () => {
    setIsLoading(true)
    
    const result = await adminAnnouncementService.disableAnnouncement()
    
    if (result.success) {
      setCurrentAnnouncement(null)
      setSubmitStatus('success')
      setSubmitMessage('Announcement disabled successfully!')
    } else {
      setSubmitStatus('error')
      setSubmitMessage(`Failed to disable announcement: ${result.error}`)
    }
    
    setIsLoading(false)
  }

  // Passcode screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl border border-border p-8 max-w-md w-full mx-4"
        >
          <div className="text-center space-y-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
            <p className="text-muted-foreground text-sm">
              Enter the admin passcode to continue
            </p>
            
            {/* Security Status */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isSecureConnection ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <span className={isSecureConnection ? 'text-green-400' : 'text-yellow-400'}>
                  {isSecureConnection ? 'Secure Connection' : 'Insecure Connection'}
                </span>
              </div>
              <div className="text-muted-foreground">
                IP: {userIP || 'Detecting...'}
              </div>
              {userLocation && (
                <div className="text-muted-foreground">
                  📍 {userLocation}
                </div>
              )}
              <div className="flex items-center justify-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-green-400">
                  Accessible from Anywhere
                </span>
              </div>
              {loginAttempts > 0 && (
                <div className="text-orange-400">
                  Attempts: {loginAttempts}/{MAX_LOGIN_ATTEMPTS}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            {isLockedOut && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                <Lock className="w-4 h-4 inline mr-2" />
                Account locked. Try again in {Math.ceil((lockoutEndTime - Date.now()) / 60000)} minutes.
              </div>
            )}
            
            <div className="space-y-2">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                disabled={isLockedOut}
                className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder-muted-foreground text-center text-lg tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                autoFocus
              />
              <AnimatePresence>
                {passcodeError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-sm text-center ${isLockedOut ? 'text-red-400' : 'text-orange-400'}`}
                  >
                    {passcodeError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={isLockedOut || !passcode.trim()}
              className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLockedOut ? (
                <>
                  <Lock className="w-4 h-4" />
                  Locked Out
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Authenticate
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  // Admin dashboard
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          <span>Admin Authenticated</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage site-wide announcements and view analytics</p>
      </motion.div>

      {/* Backend Status */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass rounded-2xl border border-border p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            {isBackendOnline ? <Wifi className="w-5 h-5 text-green-400" /> : <WifiOff className="w-5 h-5 text-red-400" />}
            Backend Status
          </h2>
          <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            isBackendOnline 
              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {isBackendOnline ? 'Online' : 'Offline (Using Fallback)'}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {isBackendOnline 
            ? 'Real-time announcements are active. Changes will appear instantly for all users.'
            : 'Backend is offline. Using static JSON fallback. Changes require manual deployment.'
          }
        </p>

        {!adminAnnouncementService.isApiKeyConfigured() && (
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            <strong>Security Warning:</strong> Admin API key is not configured. Please set NEXT_PUBLIC_ADMIN_API_KEY in your environment variables for secure announcement management.
          </div>
        )}
      </motion.section>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass rounded-2xl border border-border p-6 space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Live Analytics
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span>Live • Updated {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Real Visitor Analytics */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Today's Unique Visitors</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-foreground">
                  {visitorStats?.today?.uniqueVisitors || 0}
                </span>
                <span className="text-sm text-muted-foreground">people today</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-secondary" />
            7-Day Visitor Trend
          </h3>
          
          {analyticsError ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <p>❌ {analyticsError}</p>
            </div>
          ) : visitorStats ? (
            <div className="grid gap-3">
              {visitorStats.last7Days?.map((day: any, index: number) => (
                <div key={day.date} className="p-3 rounded-xl bg-background/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{day.date}</span>
                    <span className="text-lg font-bold text-foreground">{day.uniqueVisitors}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      style={{ width: `${Math.max(2, (day.uniqueVisitors / Math.max(...visitorStats.last7Days.map(d => d.uniqueVisitors))) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
              <p>Loading visitor statistics...</p>
            </div>
          )}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            📊 Real-time analytics powered by your own backend • Data refreshes every 30 seconds
          </p>
        </div>
      </motion.section>

      {/* Current Announcement */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl border border-border p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Current Active Announcement
          </h2>
          {currentAnnouncement && (
            <button
              onClick={clearAnnouncement}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  Disabling...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Disable
                </>
              )}
            </button>
          )}
        </div>

        {currentAnnouncement ? (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-foreground">{currentAnnouncement.message}</p>
            <p className="text-xs text-muted-foreground mt-2">Type: {currentAnnouncement.type}</p>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm italic">No active announcement</p>
        )}
      </motion.section>

      {/* Create Announcement */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl border border-border p-6 space-y-4"
      >
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Create Announcement
        </h2>

        <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Announcement Type
            </label>
            <div className="flex gap-2">
              {(['info', 'warning', 'success'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAnnouncementType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    announcementType === type
                      ? type === 'info'
                        ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-400'
                        : type === 'warning'
                        ? 'bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400'
                        : 'bg-green-500/20 border-2 border-green-500 text-green-400'
                      : 'bg-background/50 border-2 border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Message
            </label>
            <textarea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="Enter your announcement message..."
              rows={4}
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder-muted-foreground resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!announcement.trim() || isLoading || rateLimitRemaining > 0}
            className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Broadcasting...
              </>
            ) : rateLimitRemaining > 0 ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground rounded-full flex items-center justify-center text-xs">
                  {Math.ceil(rateLimitRemaining / 1000)}
                </div>
                Wait {Math.ceil(rateLimitRemaining / 1000)}s
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Broadcast Announcement
              </>
            )}
          </button>

          <AnimatePresence>
            {submitStatus !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-4 rounded-xl border ${
                  submitStatus === 'success' 
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                } text-center`}
              >
                {submitStatus === 'success' ? (
                  <CheckCircle className="w-5 h-5 inline mr-2" />
                ) : (
                  <AlertTriangle className="w-5 h-5 inline mr-2" />
                )}
                {submitMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.section>

      {/* Preview */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl border border-border p-6 space-y-4"
      >
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          Preview
        </h2>
        <p className="text-muted-foreground text-sm">
          This is how the announcement will appear to users:
        </p>

        {announcement.trim() && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            announcementType === 'info'
              ? 'bg-blue-500/10 border-blue-500/30'
              : announcementType === 'warning'
              ? 'bg-yellow-500/10 border-yellow-500/30'
              : 'bg-green-500/10 border-green-500/30'
          }`}>
            <Bell className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
              announcementType === 'info'
                ? 'text-blue-400'
                : announcementType === 'warning'
                ? 'text-yellow-400'
                : 'text-green-400'
            }`} />
            <p className="text-foreground text-sm">{announcement}</p>
          </div>
        )}
      </motion.section>
    </div>
  )
}
