'use client'

import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Shield, User } from 'lucide-react'
import { TabCloak } from '@/components/TabCloak'
import { AboutBlankToggle } from '@/components/AboutBlankToggle'
import { GameSuggestionForm } from '@/components/GameSuggestionForm'
import { FormSuccessNotification } from '@/components/FormSuccessNotification'
import { cn } from "@/lib/utils";
import { useUser } from '@/lib/userContext';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useCSRFToken, useFormRateLimit } from '@/lib/securityHooks';

export default function SettingsPage() {
  const { userName, setUserName, clearUserName, isLoaded, error, setError, securityState } = useUser();
  const { token: csrfToken, validateToken } = useCSRFToken();
  const { isRateLimited, recordAttempt, resetAttempts: resetRateLimit } = useFormRateLimit(5, 60000);
  const [nameInput, setNameInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Rate limiting: prevent rapid submissions
  const SUBMIT_COOLDOWN = 2000; // 2 seconds between submissions
  const MAX_SUBMIT_ATTEMPTS = 3;
  const [submitAttempts, setSubmitAttempts] = useState(0);

  // Set nameInput after component mounts to avoid hydration mismatch
  useEffect(() => {
    if (isLoaded) {
      setNameInput(userName || '');
    }
  }, [isLoaded, userName]);

  // Sanitize input to prevent XSS and injection attacks
  const sanitizeInput = useCallback((input: string): string => {
    return input
      .trim()
      // Remove potentially dangerous characters
      .replace(/[<>"'&]/g, '')
      // Limit length to prevent buffer overflow attempts
      .slice(0, 50)
      // Remove control characters
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ');
  }, []);

  const handleNameSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple simultaneous submissions
    if (isSubmitting) {
      return;
    }
    
    // CSRF token validation (for demonstration - in real app this would be server-side)
    if (!csrfToken) {
      setError('Security token not available. Please refresh the page.');
      return;
    }
    
    // Enhanced rate limiting check
    if (isRateLimited()) {
      setError('Too many attempts. Please wait before trying again.');
      return;
    }
    
    if (!recordAttempt()) {
      setError('Rate limit exceeded. Please try again later.');
      return;
    }
    
    // Rate limiting check
    const now = Date.now();
    if (now - lastSubmitTime < SUBMIT_COOLDOWN) {
      setError('Please wait before submitting again.');
      return;
    }
    
    // Check if user is locked out from userContext
    if (securityState.isLocked) {
      setError(securityState.lockUntil > now 
        ? `Account temporarily locked. Try again in ${Math.ceil((securityState.lockUntil - now) / 1000)} seconds.`
        : 'Account temporarily locked. Please try again later.');
      return;
    }
    
    const sanitizedInput = sanitizeInput(nameInput);
    
    // Validate sanitized input
    if (!sanitizedInput || sanitizedInput.length < 2) {
      setError('Name must be at least 2 characters long.');
      setSubmitAttempts(prev => prev + 1);
      return;
    }
    
    if (sanitizedInput !== nameInput.trim()) {
      setError('Name contains invalid characters and has been sanitized.');
      setNameInput(sanitizedInput);
      setSubmitAttempts(prev => prev + 1);
      return;
    }
    
    setIsSubmitting(true);
    setLastSubmitTime(now);
    
    try {
      // Simulate network delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In a real application, you would send the CSRF token to the server
      // and validate it there before processing the request
      console.log('CSRF Token for validation:', csrfToken);
      
      setUserName(sanitizedInput);
      setSubmitAttempts(0); // Reset on success
      resetRateLimit(); // Reset rate limit on success
    } catch (error) {
      console.error('Failed to save name:', error);
      setError('Failed to save name. Please try again.');
      setSubmitAttempts(prev => prev + 1);
    } finally {
      setIsSubmitting(false);
      
      // Clear submit timeout
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
      
      // Lock out after too many failed attempts
      if (submitAttempts >= MAX_SUBMIT_ATTEMPTS - 1) {
        setError('Too many failed attempts. Please wait before trying again.');
        submitTimeoutRef.current = setTimeout(() => {
          setSubmitAttempts(0);
          resetRateLimit();
        }, 30000); // 30 second lockout
      }
    }
  }, [nameInput, isSubmitting, lastSubmitTime, submitAttempts, securityState, sanitizeInput, setUserName, setError, csrfToken, isRateLimited, recordAttempt, resetRateLimit]);

  const handleNameClear = () => {
    setNameInput('');
    clearUserName();
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Prevent extremely long inputs during typing
    if (value.length > 50) {
      return;
    }
    
    setNameInput(value);
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  }, [error, setError]);

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black">
      <FormSuccessNotification />
      
      {/* Dot Background Pattern */}
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
          "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 mb-12"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 backdrop-blur-sm">
                <SettingsIcon className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Settings
                </span>
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              {isLoaded && userName ? `Personalize your experience, ${userName}.` : 'Customize your portal experience with powerful privacy and accessibility controls'}
            </p>
          </motion.div>

          {/* Settings Sections Grid */}
          <div className="space-y-6 lg:space-y-8">
            {/* Tab Cloaking Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="w-full"
            >
              <TabCloak />
            </motion.div>

            {/* About:Blank Cloaking Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.075 }}
              className="w-full"
            >
              <AboutBlankToggle />
            </motion.div>

            {/* Game Suggestions Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full"
            >
              <GameSuggestionForm />
            </motion.div>

            {/* Personalization Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="w-full"
            >
              <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-pink-600/10 backdrop-blur-xl border border-blue-500/20 dark:border-blue-400/30 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-50" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                
                <div className="relative p-8 lg:p-10 scale-105">
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-blue-500/40 shadow-lg">
                      <User className="w-6 h-6 text-blue-300" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Personalization</h2>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Customize your experience</p>
                    </div>
                  </div>
                  
                  {/* Personalization Controls */}
                  <div className="max-w-md mx-auto">
                    {/* Name Input */}
                    <div className="space-y-4">
                      <label htmlFor="userName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Your Name
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="userName"
                          type="text"
                          value={nameInput}
                          onChange={handleInputChange}
                          placeholder="Enter your name"
                          maxLength={50}
                          autoComplete="name"
                          disabled={isSubmitting || securityState.isLocked}
                          className={cn(
                            "flex-1 px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-200",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            error 
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 placeholder-red-500 dark:placeholder-red-400 focus:ring-red-500 focus:border-red-500"
                              : "border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
                          )}
                        />
                        {nameInput.trim() && (
                          <button
                            type="button"
                            onClick={handleNameClear}
                            className="px-3 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 hover:border-red-500/40 transition-all duration-200"
                            title="Clear name"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      {error && (
                        <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
                          <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                            <span className="text-red-500">⚠️</span>
                            {error}
                          </p>
                        </div>
                      )}
                      <button
                        type="submit"
                        onClick={handleNameSubmit}
                        disabled={!nameInput.trim() || 
                                 nameInput.trim() === userName || 
                                 isSubmitting || 
                                 securityState.isLocked ||
                                 (securityState.isLocked && Date.now() < securityState.lockUntil)}
                        className={cn(
                          "w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform",
                          "shadow-lg hover:scale-105 disabled:hover:scale-100",
                          "bg-gradient-to-r from-blue-600 to-purple-600",
                          "hover:from-blue-700 hover:to-purple-700",
                          "text-white",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        {isSubmitting ? 'Saving...' : 'Save Name'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Current Status */}
                  {(isLoaded && userName) && (
                    <div className="mt-6 p-4 rounded-xl bg-blue-100/50 dark:bg-blue-900/30 border border-blue-300/50 dark:border-blue-700/50 backdrop-blur-sm">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Welcome, <span className="font-semibold">{userName}</span>!
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
