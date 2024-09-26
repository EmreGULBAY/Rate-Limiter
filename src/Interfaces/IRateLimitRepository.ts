import { RateLimit } from '../Models/RateLimit';

export interface IRateLimitRepository {
  get(key: string): Promise<RateLimit | null>;
  set(rateLimit: RateLimit): Promise<void>;
}