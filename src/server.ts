import express, { Express } from "express";
import Redis from "ioredis";
import { RateLimitOptions } from "./Config/RateLimitOptions";
import { RedisRateLimitRepository } from "./Infrastructure/Redis/RedisRateLimitRepository";
import { RateLimitService } from "./Services/RateLimitService";
import { RateLimitController } from "./Controllers/RateLimitController";
import { IRateLimitRepository } from "./Interfaces/IRateLimitRepository";
import { Container } from "./Infrastructure/DI/Container";

function createApp(container: Container): Express {
  const app = express();

  const rateLimitController = container.resolve<RateLimitController>(
    "RateLimitController"
  );

  app.use(
    rateLimitController.middleware({
      windowMs: 10 * 1000,
      max: 10,
      message:
        "Rate limit exceeded. Please wait 10 seconds before trying again.",
    })
  );

  app.get("/", (req, res) => {
    res.send("success");
  });

  return app;
}

async function configureContainer(): Promise<Container> {
  const container = new Container();

  const redisClient = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  });

  const rateLimitOptions: RateLimitOptions = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later.",
    statusCode: 429,
    keyGenerator: (req) => req.ip!,
  };

  container.register<RateLimitOptions>("RateLimitOptions", rateLimitOptions);
  container.register<Redis>("RedisClient", redisClient);
  container.register<IRateLimitRepository>(
    "RateLimitRepository",
    new RedisRateLimitRepository(redisClient)
  );
  container.register<RateLimitService>(
    "RateLimitUseCase",
    new RateLimitService(
      container.resolve("RateLimitRepository"),
      container.resolve("RateLimitOptions")
    )
  );
  container.register<RateLimitController>(
    "RateLimitController",
    new RateLimitController(
      container.resolve("RateLimitUseCase"),
      container.resolve("RateLimitOptions")
    )
  );

  return container;
}

async function main() {
  const container = await configureContainer();
  const app = createApp(container);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing HTTP server");
    container.resolve<Redis>("RedisClient").quit();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
