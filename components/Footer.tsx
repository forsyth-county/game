'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Heart, Gamepad2, Shield, FileText, Sparkles, Github, Twitter, Mail, ArrowUp, Zap, Globe, Code, Users } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="relative mt-32 overflow-hidden"
    >
      {/* Subtle gradient divider */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.0, duration: 0.8 }}
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent origin-center"
      />

      <div className="relative">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Enhanced Brand section */}
            <div className="space-y-6 md:col-span-1">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="flex items-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-secondary flex items-center justify-center shadow-lg shadow-primary/25 hover:scale-110 transition-transform duration-300">
                  <Gamepad2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-foreground tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Forsyth Games</h3>
                  <p className="text-xs text-muted-foreground font-mono">Portal v5.0.0</p>
                </div>
              </motion.div>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                className="text-sm text-muted-foreground leading-relaxed max-w-xs"
              >
                A next-generation gaming portal where learning meets adventure. Fast, safe, and built for the modern web.
              </motion.p>
              
              {/* Enhanced Social links */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="flex items-center gap-3"
              >
                <button className="group w-10 h-10 rounded-xl bg-gradient-to-br from-muted/50 to-muted border border-border/50 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-primary/10">
                  <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
                <a 
                  href="https://x.com/FCSchoolsGA" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-10 h-10 rounded-xl bg-gradient-to-br from-muted/50 to-muted border border-border/50 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-primary/10"
                  aria-label="Follow us on X (Twitter)"
                >
                  <Twitter className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
                <a 
                  href="mailto:forsyth-games@schoolcancelled.today" 
                  className="group w-10 h-10 rounded-xl bg-gradient-to-br from-muted/50 to-muted border border-border/50 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-primary/10"
                  aria-label="Email us"
                >
                  <Mail className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              </motion.div>
            </div>

            {/* Enhanced Quick Links */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="space-y-6"
            >
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary animate-pulse" />
                Quick Links
              </h4>
              <div className="space-y-3">
                <Link 
                  href="/games" 
                  className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 flex items-center gap-3 group py-2 px-3 rounded-lg hover:bg-primary/5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                  <span className="group-hover:translate-x-1 transition-transform">All Games</span>
                </Link>
                <Link 
                  href="/utilities" 
                  className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 flex items-center gap-3 group py-2 px-3 rounded-lg hover:bg-primary/5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                  <span className="group-hover:translate-x-1 transition-transform">Utilities</span>
                </Link>
                <Link 
                  href="/settings" 
                  className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 flex items-center gap-3 group py-2 px-3 rounded-lg hover:bg-primary/5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                  <span className="group-hover:translate-x-1 transition-transform">Settings</span>
                </Link>
              </div>
            </motion.div>

            {/* New Features section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              className="space-y-6"
            >
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
                Features
              </h4>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground flex items-center gap-3 py-2 px-3 rounded-lg">
                  <Globe className="w-4 h-4 text-primary/40" />
                  <span>Global Access</span>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-3 py-2 px-3 rounded-lg">
                  <Code className="w-4 h-4 text-primary/40" />
                  <span>Open Source</span>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-3 py-2 px-3 rounded-lg">
                  <Users className="w-4 h-4 text-primary/40" />
                  <span>Community Driven</span>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Legal */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="space-y-6"
            >
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary animate-pulse" />
                Legal
              </h4>
              <div className="space-y-3">
                <Link 
                  href="/privacy" 
                  className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 flex items-center gap-3 group py-2 px-3 rounded-lg hover:bg-primary/5"
                >
                  <FileText className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                  <span className="group-hover:translate-x-1 transition-transform">Privacy Policy</span>
                </Link>
                <Link 
                  href="/terms" 
                  className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 flex items-center gap-3 group py-2 px-3 rounded-lg hover:bg-primary/5"
                >
                  <FileText className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                  <span className="group-hover:translate-x-1 transition-transform">Terms of Service</span>
                </Link>
                <a 
                  href="mailto:forsyth-games@schoolcancelled.today" 
                  className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 flex items-center gap-3 group py-2 px-3 rounded-lg hover:bg-primary/5"
                  aria-label="Email us"
                >
                  <Mail className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                  <span className="group-hover:translate-x-1 transition-transform">Contact Us</span>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Enhanced bottom bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="pt-8 border-t border-border/20"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-3 text-sm text-muted-foreground text-center lg:text-left">
                <span>Made with</span>
                <a 
                  href="https://www.heart.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:scale-125 transition-transform"
                  aria-label="Visit Heart.org"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse cursor-pointer" />
                </a>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">by the Weather Man</span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <a 
                  href="https://www.cloudflare.com/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer"
                  aria-label="Protected by Cloudflare"
                >
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                  <span className="text-xs text-primary font-semibold">Protected</span>
                </a>
                <span className="text-xs text-muted-foreground text-center px-3 py-1 rounded-full bg-muted/20">
                  © {currentYear} Forsyth Games Portal
                </span>
                
                {/* Enhanced Back to top button */}
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="group w-10 h-10 rounded-xl bg-gradient-to-br from-muted/50 to-muted border border-border/50 flex items-center justify-center transition-all hover:scale-110 hover:bg-gradient-to-br hover:from-primary/10 hover:to-secondary/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                  aria-label="Back to top"
                >
                  <ArrowUp className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.footer>
  )
}
