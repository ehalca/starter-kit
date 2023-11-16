import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigVariables } from '@ehalca/config';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { NotificationsService } from './services/notifications.service';
import { MailChannel } from './channels/mail/mail.channel';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail'
    }),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ConfigVariables>) => ({
        transport: configService.get('mail.transport', { infer: true }),
        defaults: configService.get('mail.defaults', { infer: true }),
        template: {
          dir: __dirname + '/channels/mail/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true
          }
        },
        options: {
          partials: {
            dir: __dirname + '/channels/mail/templates/partials',
            options: {
              strict: true
            }
          }
        }
      })
    })
  ],
  controllers: [],
  providers: [
    NotificationsService,
    MailChannel
  ],
  exports: [
    NotificationsService
  ],
})
export class NotificationsModule {}
