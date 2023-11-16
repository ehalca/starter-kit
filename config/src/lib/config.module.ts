import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import validationSchema from './config-validation.schema';
import {
  default as domainsLoader,
  DomainVariables,
} from './loaders/domains.loader';
import { default as authLoader, AuthVariables } from './loaders/auth.loader';
import { default as mailLoader, MailVariables } from './loaders/mail.loader';
import { default as dbLoader, DBVariables } from './loaders/db.loader';
import {
  default as loggerLoader,
  LoggerVariables,
} from './loaders/logger.loader';
import { LoggerProvider } from './services/logger';
import { CacheModule } from '@nestjs/cache-manager';

export type ConfigVariables = DomainVariables &
  AuthVariables &
  MailVariables &
  LoggerVariables & DBVariables;

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validationSchema: validationSchema,
      load: [domainsLoader, authLoader, mailLoader, loggerLoader, dbLoader],
    }),
    CacheModule.register()
  ],
  controllers: [],
  providers: [LoggerProvider],
  exports: [LoggerProvider, CacheModule],
})
export class ConfigModule {}
