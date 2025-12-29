import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import IORedis from 'ioredis';

@Injectable()
export class AppService {
  private prisma = new PrismaClient();
  private redis = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
    retryStrategy: () => null,
    connectTimeout: 2000,
  });

  getHello(): string {
    return 'Hello World!';
  }

  async checkHealth() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: { status: 'unknown', error: null },
        redis: { status: 'unknown', error: null },
      },
    };

    // Test PostgreSQL connection
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      health.services.database.status = 'connected';
    } catch (error) {
      health.services.database.status = 'disconnected';
      health.services.database.error = error.message;
      health.status = 'degraded';
    }

    // Test Redis connection
    try {
      await this.redis.ping();
      health.services.redis.status = 'connected';
    } catch (error) {
      health.services.redis.status = 'disconnected';
      health.services.redis.error = error.message;
      health.status = 'degraded';
    }

    return health;
  }
}
