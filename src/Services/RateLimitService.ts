import { IRateLimitRepository } from "../Interfaces/IRateLimitRepository";
import { RateLimitOptions } from "../Config/RateLimitOptions";

export class RateLimitService {
  private repository: IRateLimitRepository;

  constructor(repository: IRateLimitRepository) {
    this.repository = repository;
  }

  async isRateLimited(ip: string, options: RateLimitOptions): Promise<boolean> {
    const now = Date.now();
    let rateLimit = await this.repository.get(ip);

    console.log("Current rate limit data:", rateLimit);

    if (!rateLimit || rateLimit.resetTime <= now) {
      rateLimit = {
        key: ip,
        count: 0,
        resetTime: now + options.windowMs,
      };
      console.log("Created new rate limit:", rateLimit);
    }

    rateLimit.count++;
    await this.repository.set(rateLimit);

    console.log("Updated rate limit:", rateLimit);
    console.log("Max allowed requests:", options.max);

    return rateLimit.count > options.max;
  }
}
