import { IRateLimitRepository } from '../Interfaces/IRateLimitRepository';
import { RateLimitOptions } from '../Config/RateLimitOptions';

export class RateLimitService {
  private repository: IRateLimitRepository;
  private options: RateLimitOptions;

  constructor(repository: IRateLimitRepository, options: RateLimitOptions) {
    this.repository = repository;
    this.options = options;
  }

  async isRateLimited(ip: string): Promise<boolean> {
    const now = Date.now();
    let rateLimit = await this.repository.get(ip);

    if (!rateLimit || rateLimit.resetTime <= now) {
      rateLimit = {
        key: ip,
        count: 0,
        resetTime: now + this.options.windowMs
      };
    }

    rateLimit.count++;
    await this.repository.set(rateLimit);

    return rateLimit.count > this.options.max;
  }
}