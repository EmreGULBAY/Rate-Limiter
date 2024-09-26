import { Redis } from 'ioredis';
import { IRateLimitRepository } from '../../Interfaces/IRateLimitRepository';
import { RateLimit } from '../../Models/RateLimit';

export class RedisRateLimitRepository implements IRateLimitRepository {
  private redis: Redis;

  constructor(redisClient: Redis) {
    this.redis = redisClient;
  }

  async get(key: string): Promise<RateLimit | null> {
    const data = await this.redis.hgetall(`ratelimit:${key}`);
    if (!data.count) return null;
    return {
      key,
      count: parseInt(data.count),
      resetTime: parseInt(data.resetTime)
    };
  }

  async set(rateLimit: RateLimit): Promise<void> {
    await this.redis.hmset(`ratelimit:${rateLimit.key}`, {
      count: rateLimit.count,
      resetTime: rateLimit.resetTime
    });
    await this.redis.pexpire(`ratelimit:${rateLimit.key}`, rateLimit.resetTime - Date.now());
  }
}