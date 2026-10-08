import Redis from 'ioredis';
import { logger } from './logger';

class CacheService {
  private redis: Redis | null = null;
  private memoryCache = new Map<string, { value: any; expiry: number }>();

  constructor() {
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
        });

        this.redis.connect().catch((err) => {
          logger.warn(`Redis connection failed, using in-memory cache: ${err.message}`);
          this.redis = null;
        });
      } catch (err: any) {
        logger.warn(`Redis initialization skipped: ${err.message}`);
        this.redis = null;
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.redis) {
      try {
        const val = await this.redis.get(key);
        if (val) return JSON.parse(val) as T;
      } catch {
        // Fall back to memory cache
      }
    }

    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set(key: string, value: any, ttlSeconds: number = 600): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      } catch {
        // Fall back to memory
      }
    }

    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(keyPatternOrKey: string): Promise<void> {
    if (this.redis) {
      try {
        if (keyPatternOrKey.includes('*')) {
          const keys = await this.redis.keys(keyPatternOrKey);
          if (keys.length > 0) {
            await this.redis.del(...keys);
          }
        } else {
          await this.redis.del(keyPatternOrKey);
        }
      } catch {
        // Fall back to memory
      }
    }

    // In-memory pattern or key deletion
    if (keyPatternOrKey.includes('*')) {
      const regex = new RegExp('^' + keyPatternOrKey.replace(/\*/g, '.*') + '$');
      for (const k of this.memoryCache.keys()) {
        if (regex.test(k)) this.memoryCache.delete(k);
      }
    } else {
      this.memoryCache.delete(keyPatternOrKey);
    }
  }
}

export const cache = new CacheService();
