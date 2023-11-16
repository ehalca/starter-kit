import { Module } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigVariables } from '@ehalca/config';
import { APP_PIPE } from '@nestjs/core';
import { AuthModule, Entities } from '@ehalca/auth';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule, AuthModule, TypeOrmModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService<ConfigVariables>) => {
      const opts = configService.get('db', { infer: true });
      if (!opts || !opts.type) {
        throw new Error('No database configuration found');
      }
      return {
        ...opts,
        entities: [
          ...Entities
        ]
      } as any
    },
  }),],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
