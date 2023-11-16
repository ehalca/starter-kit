import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PermissionsRepository } from '../../permissions/repositories/permissions.repository';
import { LoggedUser } from '../../permissions/dictionary';
import { UsersRepository } from '../../organizations/repositories/users-repository.service';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';
import { Request } from 'express';

const Extractors = ExtractJwt.fromExtractors([
  ExtractJwt.fromHeader('x-refresh-token'),
  ExtractJwt.fromUrlQueryParameter('refresh_token')
]);

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
  constructor(
    private permissionsRepository: PermissionsRepository,
    private organizationUsersRepository: UsersRepository,
    private authService: AuthService,
    configService: ConfigService
  ) {
    super({
      jwtFromRequest: Extractors,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.refreshToken.secret'),
      passReqToCallback: true
    });
  }

  async validate(request: Request, payload: any): Promise<LoggedUser> {
    const jwt = Extractors(request);
    const isTokenValid = await this.authService.validateRefreshToken(jwt, payload.sub);
    if (isTokenValid) {
      return {
        id: payload.sub,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        permissions: await this.permissionsRepository.getUserAppPermissions(payload.sub),
        organizations: await this.organizationUsersRepository.findByUserId(payload.sub)
      };
    }
  }
}
