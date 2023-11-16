import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigVariables } from '@ehalca/config';

export interface MailOptions {
  to: string;
  subject: string;
  template: string;
  context: unknown;
}

@Injectable()
export class MailChannel {
  constructor(
    private readonly configService: ConfigService<ConfigVariables>,
    @InjectQueue('mail') private readonly mailQueue: Queue
  ) {}

  public userActivation(registerRequest: {
    emailAddress: string;
    verificationCode: string;
    registerData: string;
  }) {
    const user = JSON.parse(registerRequest.registerData ?? '{}');

    return this.sendMail({
      to: registerRequest.emailAddress,
      subject: 'Activate your email',
      template: 'activate-account',
      context: {
        verificationCode: registerRequest.verificationCode,
        verificationLink: `${this.configService.get('domains.appDomain', {
          infer: true,
        })}/activate?email=${encodeURIComponent(user.email)}&code=${
          registerRequest.verificationCode
        }`,
        user,
      },
    });
  }

  public userWelcome(user: {
    email: string;
    firstName: string;
    lastName: string;
  }) {
    return this.sendMail({
      to: user.email,
      subject: 'Welcome to the app',
      template: 'welcome-account',
      context: {
        name: `${user.firstName} ${user.lastName}`,
      },
    });
  }

  public resetPassword(
    user: { email: string },
    passwordRequest: {
      id: string;
      code: string;
    }
  ) {
    const searchParams = new URLSearchParams();
    searchParams.set('id', passwordRequest.id);
    searchParams.set('email', user.email);

    return this.sendMail({
      to: user.email,
      subject: 'Reset your password',
      template: 'reset-password',
      context: {
        code: passwordRequest.code,
        resetLink: `${this.configService.get('domains.appDomain', {
          infer: true,
        })}/reset-password?${searchParams.toString()}`,
      },
    });
  }

  public passwordResetConfirmation(user: { email: string }) {
    return this.sendMail({
      to: user.email,
      subject: 'Your password has been reset',
      template: 'password-reset-confirmation',
      context: {
        link: `${this.configService.get('domains.appDomain', { infer: true })}`,
      },
    });
  }

  public loginAuthentication(
    user: { email: string },
    authenticationRequest: { code: string}
  ) {
    return this.sendMail({
      to: user.email,
      subject: 'Earn Authentication Action',
      template: 'login-authentication-request',
      context: {
        code: authenticationRequest.code,
      },
    });
  }

  private async sendMail(options: MailOptions) {
    if (this.configService.get('mail.disabled', { infer: true })) {
      return true;
    }
    const testSender = this.configService.get('mail.testSender', {
      infer: true,
    });
    if (testSender && options.to !== testSender) {
      options.to = testSender;
    }

    return this.mailQueue.add('send', options);
  }
}
