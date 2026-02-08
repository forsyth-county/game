'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { games } from '@/data/games'
import { GameCard } from '@/components/GameCard'
import { GridBackground } from '@/components/ui/grid-background-demo'
import { config } from '@/config/games'

// Popular games that should be shown first
const popularGames = [
  '1v1lol', '10-minutes-till-dawn', 'bloons-tower-defense-5', 'fruit-ninja',
  'plants-vs-zombies', 'among-us', 'eaglercraft', 'monkey-mart', 'temple-run-2',
  'subway-surfers', 'crossy-road', 'geometry-dash', 'minecraft', 'retro-bowl'
]

export default function GamesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter games based on search and appropriateness
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = 
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.category.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesAppropriateness = config.filterInappropriateContent ? !game.inappropriate : true
      
      return matchesSearch && matchesAppropriateness
    })
  }, [searchQuery])

  // Get popular games
  const popularGamesList = useMemo(() => {
    return filteredGames.filter(game => popularGames.includes(game.id))
  }, [filteredGames])

  // Group remaining games by category
  const categorizedGames = useMemo(() => {
    const remainingGames = filteredGames.filter(game => !popularGames.includes(game.id))
    
    const grouped: Record<string, typeof games> = {}
    remainingGames.forEach(game => {
      if (!grouped[game.category]) {
        grouped[game.category] = []
      }
      grouped[game.category].push(game)
    })

    return grouped
  }, [filteredGames])

  const totalGames = filteredGames.length

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <GridBackground />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-black">
          <span className="text-gradient">Educational Games</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Browse our collection of {games.length} educational learning activities
        </p>
        <p className="text-yellow-500/80 font-medium">
          📚 Educational Learning Platform - Use Responsibly
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="sticky top-20 z-40"
      >
        <div className="glass rounded-2xl border border-border p-4 shadow-2xl max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search educational activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-lg"
            />
          </div>
        </div>
      </motion.div>

      {/* Games Grid */}
      {totalGames === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="text-2xl text-muted-foreground">No games found</p>
          <p className="text-muted-foreground mt-2">Try a different search term</p>
        </motion.div>
      ) : (
        <div className="space-y-16">
          {/* Popular Games Section */}
          {popularGamesList.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl md:text-4xl font-bold text-gradient">
                  We may think you like this
                </h2>
                <p className="text-muted-foreground text-lg">
                  Popular games that everyone enjoys
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {popularGamesList.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <GameCard game={game} className="w-full" />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Categories Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gradient">
                Categories
              </h2>
              <p className="text-muted-foreground text-lg">
                Browse games by category
              </p>
            </div>

            <div className="space-y-12">
              {Object.entries(categorizedGames)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([category, categoryGames], categoryIndex) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + categoryIndex * 0.1 }}
                    className="space-y-6"
                  >
                    <h3 className="text-2xl md:text-3xl font-bold text-primary tracking-wider">
                      {category}
                      <span className="ml-3 text-sm text-muted-foreground font-normal">
                        ({categoryGames.length})
                      </span>
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {categoryGames.map((game, index) => (
                        <motion.div
                          key={game.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.05 * index }}
                        >
                          <GameCard game={game} className="w-full" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.section>
        </div>
      )}
    </div>
  )
}
