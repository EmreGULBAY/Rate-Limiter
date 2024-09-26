import express from "express";
import Redis from "ioredis";
import { Container } from "./Infrastructure/DI/Container";
import { RateLimitController } from "./Controllers/RateLimitController";
import { RateLimitService } from "./Services/RateLimitService";
import { RedisRateLimitRepository } from "./Infrastructure/Redis/RedisRateLimitRepository";

async function main() {
  const app = express();

  const redisClient = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  });

  const container = new Container();

  container.register("RedisClient", redisClient);
  container.register(
    "RateLimitRepository",
    new RedisRateLimitRepository(redisClient)
  );
  container.register(
    "RateLimitUseCase",
    new RateLimitService(container.resolve("RateLimitRepository"))
  );
  container.register(
    "RateLimitController",
    new RateLimitController(container.resolve("RateLimitUseCase"))
  );

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

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing HTTP server");
    redisClient.flushall();
    redisClient.quit();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
