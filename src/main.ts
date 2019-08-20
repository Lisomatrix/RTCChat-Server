import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { ErrorFilter } from './filters/ErrorFilter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify';
import { RedisIoAdapter } from './adapters/redis.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: false }), {

  });

  app.useWebSocketAdapter(new RedisIoAdapter(app));
  app.enableCors({ credentials: true, origin: true });
  app.useGlobalFilters(new ErrorFilter());

  await app.listen(3000);
}
bootstrap();
