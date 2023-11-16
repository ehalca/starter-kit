import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PermissionsRepository } from '../../permissions/repositories/permissions.repository';
import { ApiTokenRepository } from '../../users/repositories/api-token.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { pick } from 'lodash';
import { UsersRepository as UsersOrganizationRepository } from '../../organizations/repositories/users-repository.service';
import * as httpSignature from 'http-signature';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class SignatureStrategy extends PassportStrategy(Strategy, 'signature') {
  constructor(
    private permissionsRepository: PermissionsRepository,
    private userRepository: UsersRepository,
    private organizationUsersRepository: UsersOrganizationRepository,
    private apiTokenRepository: ApiTokenRepository,
    private configService: ConfigService
  ) {
    super();
  }

  async validate(request: Request) {
    let parsedRequest;
    try {
      parsedRequest = httpSignature.parseRequest(request, {
        headers: this.configService.get<string[]>('auth.httpSignatureHeaders')
      });
    } catch (e) {
      return false;
    }
    const apiToken = await this.apiTokenRepository.getEntity(parsedRequest.params.keyId);
    if (!apiToken) {
      return false;
    }
    const user = await this.userRepository.getEntity(apiToken.userId);
    try {
      if (httpSignature.verifySignature(parsedRequest, apiToken.publicKey)) {
        return {
          ...pick(user, ['id', 'email', 'firstName', 'lastName']),
          permissions: await this.permissionsRepository.getUserAppPermissions(user.id),
          organizations: await this.organizationUsersRepository.findByUserId(user.id)
        };
      }
    } catch (e) {
      return false;
    }
  }
}
