import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigVariables } from '@ehalca/config';
import { NotificationsModule } from '@ehalca/notifications';
import { EmailAuthenticationRequest } from './entities/email-authentication-request.entity';
import { LoginAttempt } from './entities/login-attempt.entity';
import { RegisterRequest } from './entities/register-request.entity';
import { ResetPasswordRequest } from './entities/reset-pass-request.entity';
import { AuthRepository } from './repositories/auth.repository';
import { AuthService } from './services/auth.service';
import { TwoFactorAuthService } from './services/two-factor-auth.service';
import { User } from './entities/user.entity';
import { UsersService } from './services/users.service';
import { RolesRepository } from './repositories/role.repository';
import { UsersRepository } from './repositories/users.repository';
import { TwoFactorAuthentication } from './entities/two-factor-authentication.entity';
import { Role } from './entities/role.entity';
import { AuthController } from './controllers/auth.controller';
import { AuthSeederService } from './services/seeder.service';
import { PermissionAssigned } from './entities/permission-assigned.entity';
import { Permission } from './entities/permission.entity';
import { PermissionsRepository } from './repositories/permissions.repository';

export const Entities = [
  RegisterRequest,
  ResetPasswordRequest,
  LoginAttempt,
  EmailAuthenticationRequest,
  TwoFactorAuthentication,
  Role,
  User,
  PermissionAssigned,
  Permission,
]

@Module({
  imports: [
    NotificationsModule,
    TypeOrmModule.forFeature(Entities),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ConfigVariables>) => {
        const { secret, expiresIn } = configService.get('auth', {
          infer: true,
        })!;
        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    PermissionsRepository,
    AuthRepository,
    AuthService,
    TwoFactorAuthService,
    UsersService,
    RolesRepository,
    UsersRepository,
    AuthSeederService,
  ],
  exports: [],
})
export class AuthModule {}
