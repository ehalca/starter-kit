/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getNxApiUrl } from '@ehalca/config';

import { AppModule } from './app/app.module';
import { LoggerProvider } from '@ehalca/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const apiUrl = getNxApiUrl();
  const globalPrefix = (apiUrl.pathname ?? 'api').replace(/\//, '');
  const loggerProvider = app.get(LoggerProvider);
  app.useLogger(loggerProvider.logger);
  app.setGlobalPrefix(globalPrefix);
  await app.listen(apiUrl.port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${apiUrl.port}/${globalPrefix}`
  );
}

bootstrap();
