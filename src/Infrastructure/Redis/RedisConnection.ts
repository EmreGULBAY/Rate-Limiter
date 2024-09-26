import { createClient } from "redis";
import RedisError from "../../Models/ErrorModels/RedisError";
import dotenv from "dotenv";

dotenv.config();
let client: ReturnType<typeof createClient>;
let isRedisConnected = false;
let retryAttempts = 0;

export const createRedis = async () => {
  if (!client || !isRedisConnected) {
    client = createClient({
      url: process.env.REDIS_URI,
      socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.log("Max reconnection attempts reached. Stopping...");
            throw new RedisError("Max reconnection attempts reached", 500);
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    client.on("connect", () => {
      isRedisConnected = true;
      retryAttempts = 0;
      console.log("Redis connected successfully.");
    });

    client.on("error", (err) => {
      isRedisConnected = false;
      console.log("Redis connection error: " + err);
    });

    client.on("end", () => {
      isRedisConnected = false;
      console.log("Redis connection closed.");
    });

    try {
      await client.connect();
    } catch (err) {
      console.error("Failed to connect to Redis:", err);
      throw err;
    }
  }
  return client;
};

export const connectRedis = async () => {
  dotenv.config();
  console.log("Initializing Redis client...");
  await createRedis();
  console.log("Redis client created and connected.");
};

export const setRedis = async (key: string, content: string) => {
  try {
    const redisClient = await createRedis();
    await redisClient.set(key, content);
    console.log(key + " set to redis ");
  } catch (err) {
    console.error("Error in setRedis:", err);
    throw new RedisError("An unexpected error occurred", 500);
  }
};

export const getRedis = async (key: string) => {
  try {
    const redisClient = await createRedis();
    const content = await redisClient.get(key);
    console.log(key + " get from redis " + content);
    return content;
  } catch (err) {
    console.error("Error in getRedis:", err);
    throw new RedisError("An unexpected error occurred", 500);
  }
};
