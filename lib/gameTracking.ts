'use client'

import { Game } from '@/lib/types'

// Storage keys
const PLAY_HISTORY_KEY = 'forsyth-game-history'
const FAVORITES_KEY = 'forsyth-game-favorites'

// Types
export interface GamePlay {
  gameId: string
  timestamp: number
  count: number
}

export interface GameHistory {
  plays: GamePlay[]
  lastUpdated: number
}

// Maximum number of games to track in history
const MAX_HISTORY_SIZE = 50

/**
 * Get play history from localStorage
 */
export function getPlayHistory(): GameHistory {
  if (typeof window === 'undefined') {
    return { plays: [], lastUpdated: Date.now() }
  }

  try {
    const stored = localStorage.getItem(PLAY_HISTORY_KEY)
    if (!stored) {
      return { plays: [], lastUpdated: Date.now() }
    }

    const parsed = JSON.parse(stored) as GameHistory
    return parsed
  } catch (error) {
    console.warn('Failed to read play history:', error)
    return { plays: [], lastUpdated: Date.now() }
  }
}

/**
 * Track when a user plays a game
 */
export function trackGamePlay(gameId: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const history = getPlayHistory()
    const now = Date.now()

    // Find if game already exists in history
    const existingIndex = history.plays.findIndex(p => p.gameId === gameId)

    if (existingIndex >= 0) {
      // Update existing entry
      history.plays[existingIndex].count++
      history.plays[existingIndex].timestamp = now
    } else {
      // Add new entry
      history.plays.push({
        gameId,
        timestamp: now,
        count: 1
      })
    }

    // Sort by most recent first
    history.plays.sort((a, b) => b.timestamp - a.timestamp)

    // Limit size
    if (history.plays.length > MAX_HISTORY_SIZE) {
      history.plays = history.plays.slice(0, MAX_HISTORY_SIZE)
    }

    history.lastUpdated = now

    localStorage.setItem(PLAY_HISTORY_KEY, JSON.stringify(history))
  } catch (error) {
    console.warn('Failed to track game play:', error)
  }
}

/**
 * Get most played games
 */
export function getMostPlayedGames(limit: number = 10): GamePlay[] {
  const history = getPlayHistory()
  return history.plays
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/**
 * Get recently played games
 */
export function getRecentlyPlayedGames(limit: number = 10): GamePlay[] {
  const history = getPlayHistory()
  return history.plays
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
}

/**
 * Get category preferences based on play history
 */
export function getCategoryPreferences(allGames: Game[]): Map<string, number> {
  const history = getPlayHistory()
  const categoryScores = new Map<string, number>()

  // Create a map of game ID to game for quick lookup
  const gameMap = new Map(allGames.map(g => [g.id, g]))

  // Score categories based on plays
  history.plays.forEach(play => {
    const game = gameMap.get(play.gameId)
    if (game && game.category) {
      const currentScore = categoryScores.get(game.category) || 0
      // Weight by both count and recency
      const recencyWeight = Math.max(0.1, 1 - (Date.now() - play.timestamp) / (30 * 24 * 60 * 60 * 1000)) // decay over 30 days
      categoryScores.set(game.category, currentScore + (play.count * recencyWeight))
    }
  })

  return categoryScores
}

/**
 * Get personalized game recommendations
 */
export function getPersonalizedRecommendations(
  allGames: Game[],
  limit: number = 12,
  excludeGameIds: string[] = []
): Game[] {
  const history = getPlayHistory()
  
  // If no history, return popular games (fallback)
  if (history.plays.length === 0) {
    return []
  }

  // Get category preferences
  const categoryPreferences = getCategoryPreferences(allGames)
  
  // Get recently played game IDs to exclude
  const recentlyPlayedIds = new Set(
    history.plays.slice(0, 5).map(p => p.gameId).concat(excludeGameIds)
  )

  // Score each game
  const gameScores = allGames
    .filter(game => !recentlyPlayedIds.has(game.id))
    .map(game => {
      let score = 0

      // Category preference score
      const categoryScore = categoryPreferences.get(game.category) || 0
      score += categoryScore * 10

      // Boost if same developer/series (basic heuristic based on name similarity)
      const playedGames = history.plays.slice(0, 10).map(p => {
        const g = allGames.find(g => g.id === p.gameId)
        return g?.name || ''
      })
      
      playedGames.forEach(playedName => {
        // Check for common words (series/franchise detection)
        const commonWords = game.name.split(' ').filter(word => 
          word.length > 3 && playedName.includes(word)
        )
        if (commonWords.length > 0) {
          score += 5 * commonWords.length
        }
      })

      return { game, score }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.game)

  return gameScores
}

/**
 * Clear play history (for privacy/reset)
 */
export function clearPlayHistory(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(PLAY_HISTORY_KEY)
  } catch (error) {
    console.warn('Failed to clear play history:', error)
  }
}

/**
 * Check if user has any play history
 */
export function hasPlayHistory(): boolean {
  const history = getPlayHistory()
  return history.plays.length > 0
}
