'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Gamepad2 } from 'lucide-react'

const FORM_COOLDOWN_MS = 60 * 60 * 1000 // 60 minutes



export function GameSuggestionForm() {
  const [result, setResult] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)

  // Check for cooldown on mount
  useEffect(() => {
    // Ensure we're in a browser environment
    if (typeof window === 'undefined') return
    
    const lastSubmission = localStorage.getItem('forsyth-form-last-submit')
    if (lastSubmission) {
      const timeSinceSubmit = Date.now() - parseInt(lastSubmission)
      
      if (timeSinceSubmit < FORM_COOLDOWN_MS) {
        const remaining = Math.ceil((FORM_COOLDOWN_MS - timeSinceSubmit) / 1000)
        setCooldownRemaining(remaining)
        
        // Start countdown
        const interval = setInterval(() => {
          const newRemaining = Math.ceil((FORM_COOLDOWN_MS - (Date.now() - parseInt(lastSubmission))) / 1000)
          if (newRemaining <= 0) {
            setCooldownRemaining(0)
            clearInterval(interval)
          } else {
            setCooldownRemaining(newRemaining)
          }
        }, 1000)
        
        return () => clearInterval(interval)
      }
    }
  }, [])

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    // Ensure we're in a browser environment
    if (typeof window === 'undefined') return
    
    // Check hCaptcha
    const form = event.target as HTMLFormElement
    const hCaptchaResponse = form.querySelector('textarea[name=h-captcha-response]') as HTMLTextAreaElement
    
    if (!hCaptchaResponse || !hCaptchaResponse.value) {
      setResult("Please complete the captcha verification")
      return
    }
    
    // Check rate limit
    const lastSubmission = localStorage.getItem('forsyth-form-last-submit')
    if (lastSubmission) {
      const timeSinceSubmit = Date.now() - parseInt(lastSubmission)
      if (timeSinceSubmit < FORM_COOLDOWN_MS) {
        const remaining = Math.ceil((FORM_COOLDOWN_MS - timeSinceSubmit) / 1000)
        setResult(`Please wait ${remaining} seconds before submitting another suggestion.`)
        return
      }
    }
    
    setIsSubmitting(true)
    setResult("Sending....")
    
    const formData = new FormData(event.target as HTMLFormElement)

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      })

      const data = await response.json()
      
      // Log the response for debugging
      console.log("Web3Forms Response:", data)
      console.log("Response status:", response.status)
      
      if (data.success) {
        setResult("Game suggestion submitted successfully! Thank you!")
        ;(event.target as HTMLFormElement).reset()
        
        // Set cooldown
        localStorage.setItem('forsyth-form-last-submit', Date.now().toString())
        setCooldownRemaining(60)
        
        // Redirect to custom success page after successful submission
        setTimeout(() => {
          window.location.href = 'https://forsyth.games/settings?success=true'
        }, 2000)
        
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
      } else {
        console.error("Form submission failed:", data)
        setResult(`Error: ${data.message || "Unknown error occurred. Please try again."}`)
      }
    } catch (error) {
      console.error("Form submission error:", error)
      setResult("Unable to submit your suggestion. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-8 lg:p-10 space-y-6">
        {/* Section Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <Gamepad2 className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Game Suggestions</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Help us improve the game library</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          Have a game you&apos;d like to see added to the portal? Let us know! We review all suggestions and add the best games regularly.
        </p>

        {/* Suggestion Form */}
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Hidden fields for Web3Forms */}
          <input type="hidden" name="access_key" value="e93c5755-8acb-4e64-872b-2ba9d3b00e54" />
          <input type="hidden" name="subject" value="New Game Suggestion from Forsyth Games Portal" />
          <input type="hidden" name="from_name" value="Forsyth Games Portal User" />
          
          {/* Honeypot field - must be hidden and empty */}
          <input type="checkbox" name="botcheck" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          
          {/* Game Suggestion Input */}
          <div className="space-y-3">
            <label htmlFor="message" className="block text-sm font-semibold text-slate-900 dark:text-white">
              Tell us about the game you&apos;d like to see
            </label>
            <div className="relative">
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                className="w-full px-6 py-4 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-600/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300 resize-none text-base leading-relaxed"
                placeholder="Share details about the game you'd like us to add..."
                disabled={isSubmitting}
              />
              <div className="absolute bottom-4 right-4 text-xs text-slate-500 dark:text-slate-400">
                {typeof document !== 'undefined' && 
                  document.getElementById('message') && 
                  (document.getElementById('message') as HTMLTextAreaElement).value.length}/500
              </div>
            </div>
          </div>

          {/* hCaptcha */}
          <div className="h-captcha" data-captcha="true"></div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || cooldownRemaining > 0}
            className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {cooldownRemaining > 0 
              ? `Please wait ${cooldownRemaining}s` 
              : isSubmitting 
                ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                )  
                : (
                  <span className="flex items-center justify-center gap-2">
                    <Gamepad2 className="w-5 h-5" />
                    Submit Suggestion
                  </span>
                )}
          </button>

          {/* Result Messages */}
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-2xl text-center ${
                result.includes("successfully")
                  ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 text-green-700/90 dark:text-green-300/90"
                  : result.includes("Error") || result.includes("captcha")
                  ? "bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 text-red-700/90 dark:text-red-300/90"
                  : "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-blue-700/90 dark:text-blue-300/90"
              }`}
            >
              {result}
            </motion.div>
          )}
        </form>

        {/* Info Note */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <p className="text-sm text-purple-700/90 dark:text-purple-300/90">
            🎮 <strong>Tip:</strong> Your suggestion will be reviewed by our team. We appreciate your input in making this portal better for everyone!
          </p>
        </div>
      </div>
    </section>
  )
}
