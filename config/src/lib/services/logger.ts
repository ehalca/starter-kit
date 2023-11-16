import { ConsoleLogger, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as Winston from 'winston';
import { ConfigVariables } from '../config.module';

export enum LoggerType {
  Console = 'console',
  WINSTON = 'winston',
}

@Injectable()
export class LoggerProvider {
  public logger: LoggerService;

  public constructor(readonly configService: ConfigService<ConfigVariables>) {
    if (
      configService.get('logger.type', { infer: true }) === 'winston'
    ) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const options = configService.get('logger.winston', { infer: true })!;
      this.logger = LoggerProvider.getWinstonLogger(options);
    } else {
      this.logger = LoggerProvider.getDefaultLogger();
    }
  }

  public static getWinstonLogger(opts: {
    level: string;
    isConsole: boolean;
    fileName: string;
  }) {
    const transports = [];

    if (opts.isConsole) {
      transports.push(
        new Winston.transports.Console({
          format: Winston.format.simple(),
        })
      );
    }

    if (opts.fileName) {
      transports.push(
        new Winston.transports.File({
          filename: opts.fileName,
          format: Winston.format.simple(),
        })
      );
    }

    return WinstonModule.createLogger({
      level: opts.level,
      format: Winston.format.simple(),
      transports,
    });
  }

  public static getDefaultLogger() {
    return new ConsoleLogger();
  }
}
