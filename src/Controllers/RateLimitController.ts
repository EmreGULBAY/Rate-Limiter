import { Request, Response, NextFunction } from "express";
import { RateLimitService } from "../Services/RateLimitService";
import {
  RateLimitOptions,
  defaultRateLimitConfig,
} from "../Config/RateLimitOptions";

export class RateLimitController {
  private useCase: RateLimitService;

  constructor(useCase: RateLimitService) {
    this.useCase = useCase;
  }

  middleware(options: RateLimitOptions) {
    const fullOptions = { ...defaultRateLimitConfig, ...options };

    return async (req: Request, res: Response, next: NextFunction) => {
      if (fullOptions.skip && fullOptions.skip(req)) {
        return next();
      }

      const ip = fullOptions.keyGenerator
        ? fullOptions.keyGenerator(req)
        : req.ip;
      console.log("Rate limit key:", ip);

      const isLimited = await this.useCase.isRateLimited(ip!, fullOptions);

      if (isLimited) {
        res.status(fullOptions.statusCode!).send(fullOptions.message);
      } else {
        next();
      }
    };
  }
}
