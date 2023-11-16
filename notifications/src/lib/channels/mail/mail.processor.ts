import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import * as inlineBase64 from 'nodemailer-plugin-inline-base64';
import { Logger } from '@nestjs/common';

@Processor('mail')
export class MailProcessor {
  logger = new Logger(MailProcessor.name);

  constructor(private mailerService: MailerService) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: transporter is private, refactor this when https://github.com/nest-modules/mailer/issues/734 is fixed
    this.mailerService.transporter.use('compile', inlineBase64());
  }

  @Process('send')
  async sendMail(job: Job<ISendMailOptions>) {
    const { data } = job;

    try {
      await this.mailerService.sendMail(data);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
