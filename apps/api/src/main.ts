import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3001);

  const connection = new IORedis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379");
  const taskQueue = new Queue('tasks', { connection });

  await taskQueue.add('send-email', { to: 'test@example.com', body: 'Hello!' });
}
bootstrap();

