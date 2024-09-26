class RedisError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "RedisError";
    this.statusCode = statusCode;
  }

  static from(error: string, statusCode: number): RedisError {
    return new RedisError(error, statusCode);
  }
}

export default RedisError;
