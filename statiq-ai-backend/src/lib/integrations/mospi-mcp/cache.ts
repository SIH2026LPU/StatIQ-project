/**
 * Simple in-memory TTL cache for MoSPI MCP responses.
 * Prevents hammering the MCP server for stable data (dataset list, indicator metadata).
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class TTLCache {
  private store = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// Singleton cache instance
export const mcpCache = new TTLCache();

export const TTL = {
  DATASETS: 10 * 60 * 1000,   // 10 minutes — dataset list rarely changes
  INDICATORS: 5 * 60 * 1000,  // 5 minutes — indicators rarely change
  METADATA: 2 * 60 * 1000,    // 2 minutes — metadata (filter codes) rarely changes
  DATA: 0,                     // No caching for actual data — always fresh
};
