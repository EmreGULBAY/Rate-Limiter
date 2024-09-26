import { Request } from 'express';

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message: string;
  statusCode?: number;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}

export interface RequestCount {
  count: number;
  resetTime: number;
}

export const defaultRateLimitConfig: Omit<RateLimitOptions, 'windowMs' | 'max' | 'message'> = {
  statusCode: 429,
  keyGenerator: (req: Request) => req.ip as string,
  skip: () => false
};