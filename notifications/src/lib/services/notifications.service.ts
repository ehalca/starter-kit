import { Injectable } from '@nestjs/common';
import { MailChannel } from '../channels/mail/mail.channel';


@Injectable()
export class NotificationsService {
  constructor(private mailChannel: MailChannel) {}

  public userActivation(registerRequest: {
    emailAddress: string;
    verificationCode: string;
    registerData: string;
  }) {
    return this.mailChannel.userActivation(registerRequest);
  }

  public userWelcome(user: {
    email: string;
    firstName: string;
    lastName: string;
  }) {
    return this.mailChannel.userWelcome(user);
  }

  public resetPassword(user: {
    email: string;
  }, passwordRequest: {
    id: string;
    code: string;
  }) {
    return this.mailChannel.resetPassword(user, passwordRequest);
  }

  public passwordResetConfirmation(user: {
    email: string;
  }) {
    return this.mailChannel.passwordResetConfirmation(user);
  }

  public loginAuthentication(user: {
    email: string;
  }, authenticationRequest: {
    id: string;
    code: string;
  }) {
    return this.mailChannel.loginAuthentication(user, authenticationRequest);
  }
}
