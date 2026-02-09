'use client'

import { motion } from 'framer-motion'
import { FileText, Calendar, Zap, Bug, Plus, Trash2, Settings } from 'lucide-react'

interface ChangeEntry {
  version: string
  date: string
  changes: {
    type: 'feature' | 'fix' | 'improvement' | 'removed'
    description: string
  }[]
}

const changelog: ChangeEntry[] = [
  {
    version: '5.1.0',
    date: 'February 9, 2026',
    changes: [
      { type: 'feature', description: 'Added share notification with copy link functionality' },
      { type: 'feature', description: 'Added changelog page' },
      { type: 'improvement', description: 'Updated Google Analytics tracking configuration' },
      { type: 'improvement', description: 'Footer now integrates seamlessly with the website design' },
      { type: 'improvement', description: 'Twitter/X link now points to @FCSchoolsGA' },
      { type: 'improvement', description: 'Protected badge now links to Cloudflare' },
      { type: 'removed', description: 'Removed rating popup system' },
      { type: 'removed', description: 'Removed Google Tag Manager tracking from all games' },
      { type: 'removed', description: 'Removed "About" page from footer quick links' },
    ],
  },
  {
    version: '5.0.0',
    date: 'January 2026',
    changes: [
      { type: 'feature', description: 'Complete redesign with modern UI/UX' },
      { type: 'feature', description: 'Added 112+ educational games' },
      { type: 'feature', description: 'Tab cloaking system for privacy' },
      { type: 'feature', description: 'Dark mode by default' },
      { type: 'feature', description: 'Advanced utilities section' },
      { type: 'feature', description: 'Admin dashboard at /spec-ops' },
      { type: 'improvement', description: 'Enhanced performance and loading times' },
      { type: 'improvement', description: 'Mobile-responsive design' },
    ],
  },
]

const iconMap = {
  feature: Plus,
  fix: Bug,
  improvement: Zap,
  removed: Trash2,
}

const colorMap = {
  feature: 'text-green-500',
  fix: 'text-red-500',
  improvement: 'text-blue-500',
  removed: 'text-orange-500',
}

const bgMap = {
  feature: 'bg-green-500/10',
  fix: 'bg-red-500/10',
  improvement: 'bg-blue-500/10',
  removed: 'bg-orange-500/10',
}

export default function ChangelogPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3">
          <FileText className="w-12 h-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-black">
            <span className="text-gradient">Changelog</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Track all updates and improvements to Forsyth Games Portal
        </p>
      </motion.div>

      <div className="space-y-8">
        {changelog.map((entry, index) => (
          <motion.div
            key={entry.version}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-2xl border border-border p-8 space-y-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                  Version {entry.version}
                  {index === 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-semibold">
                      Latest
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{entry.date}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {entry.changes.map((change, changeIndex) => {
                const Icon = iconMap[change.type]
                const color = colorMap[change.type]
                const bg = bgMap[change.type]
                
                return (
                  <motion.div
                    key={changeIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + changeIndex * 0.05 }}
                    className={`flex items-start gap-3 p-3 rounded-lg ${bg} border border-border/50 hover:border-border transition-colors`}
                  >
                    <Icon className={`w-5 h-5 ${color} mt-0.5 flex-shrink-0`} />
                    <div className="flex-1">
                      <span className={`text-xs font-semibold ${color} uppercase tracking-wide`}>
                        {change.type}
                      </span>
                      <p className="text-sm text-foreground mt-1">{change.description}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-muted-foreground"
      >
        <p>More updates coming soon! Stay tuned for new features and improvements.</p>
      </motion.div>
    </div>
  )
}
