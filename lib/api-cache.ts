// Simple in-memory cache for API requests
type CacheEntry = {
  data: any
  timestamp: number
}

class ApiCache {
  private cache: Map<string, CacheEntry> = new Map()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

  async fetchWithCache(url: string, ttl: number = this.DEFAULT_TTL): Promise<any> {
    const cacheKey = url
    const now = Date.now()
    const cachedEntry = this.cache.get(cacheKey)

    // If we have a valid cached entry, return it
    if (cachedEntry && now - cachedEntry.timestamp < ttl) {
      console.log(`Cache hit for ${url}`)
      return cachedEntry.data
    }

    // Otherwise, fetch fresh data
    console.log(`Cache miss for ${url}, fetching fresh data`)
    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Store in cache
      this.cache.set(cacheKey, {
        data,
        timestamp: now,
      })

      return data
    } catch (error) {
      console.error(`Error fetching ${url}:`, error)

      // If we have stale data, return it rather than failing
      if (cachedEntry) {
        console.log(`Returning stale data for ${url}`)
        return cachedEntry.data
      }

      throw error
    }
  }

  clearCache() {
    this.cache.clear()
  }

  removeCacheEntry(url: string) {
    this.cache.delete(url)
  }
}

// Create a singleton instance
const apiCache = new ApiCache()
export default apiCache
