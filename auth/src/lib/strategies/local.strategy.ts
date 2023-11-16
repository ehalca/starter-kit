import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Request } from 'express';
import { LoginAttempt } from '../entities/login-attempt.entity';
import { TwoFactorAuthService } from '../../users/services/two-factor-auth.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService, private twoFactorAuthService: TwoFactorAuthService) {
    super({ usernameField: 'email', passwordField: 'secret', passReqToCallback: true });
  }

  async validate(request: Request, email: string, password: string): Promise<any> {
    let loginAttempt = new LoginAttempt();
    loginAttempt.emailAddress = email;
    loginAttempt.ipAddress = request.ip;
    loginAttempt.userAgent = request.get('User-Agent');
    loginAttempt = await this.authService.saveLoginAttempt(loginAttempt);

    const data = await this.authService.validateUser(email, password, loginAttempt);
    if (!data) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    const { user, authMode } = data;
    if (authMode.tfa) {
      await this.checkTwoFactorCode(user, request.body.tfaCode);
    }

    return user;
  }

  private async checkTwoFactorCode(user: User, tfaCode: string) {
    if (!tfaCode) {
      throw new UnauthorizedException('Invalid two factor authorization code!');
    }

    const codeCheck = await this.twoFactorAuthService.checkCodeForUser(user, tfaCode);
    if (!codeCheck) {
      throw new UnauthorizedException('Invalid two factor authorization code!');
    }
  }
}
