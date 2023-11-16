import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PermissionsRepository } from '@ehalca/common';
import { LoggedUser } from '@ehalca/common';
import { ConfigService } from '@nestjs/config';
import { ConfigVariables } from '@ehalca/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private permissionsRepository: PermissionsRepository,
    configService: ConfigService<ConfigVariables>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('access_token')
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('auth.secret',{infer: true})
    });
  }

  async validate(payload: any): Promise<LoggedUser> {
    return {
      id: payload.sub,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      permissions: await this.permissionsRepository.getUserAppPermissions(payload.sub),
    };
  }
}
