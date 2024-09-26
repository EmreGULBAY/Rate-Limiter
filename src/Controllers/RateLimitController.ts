import { Request, Response, NextFunction } from 'express';
import { RateLimitService } from '../Services/RateLimitService';
import { RateLimitOptions } from '../Config/RateLimitOptions';

export class RateLimitController {
  private useCase: RateLimitService;
  private options: RateLimitOptions;

  constructor(useCase: RateLimitService, options: RateLimitOptions) {
    this.useCase = useCase;
    this.options = options;
  }

  middleware(customOptions?: Partial<RateLimitOptions>) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const options = { ...this.options, ...customOptions };

      if (options.skip && options.skip(req)) {
        return next();
      }

      const ip = options.keyGenerator ? options.keyGenerator(req) : req.ip;
      const isLimited = await this.useCase.isRateLimited(ip!);

      if (isLimited) {
        res.status(options.statusCode || 429).send(options.message || 'Too many requests');
      } else {
        next();
      }
    };
  }
}