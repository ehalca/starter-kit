import { compare, hash } from 'bcrypt';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import moment from 'moment';
import { ConfigService } from '@nestjs/config';
import {
  RegisterRequest,
  RequestStatus,
} from '../entities/register-request.entity';
import { AttemptStatus, LoginAttempt } from '../entities/login-attempt.entity';
import { ResetPasswordStatus } from '../entities/reset-pass-request.entity';
import { LoggedUser } from '@ehalca/common';
import { AuthRepository } from '../repositories/auth.repository';
import { ConfigVariables } from '@ehalca/config';
import { NotificationsService } from '@ehalca/notifications';
import { RolesRepository } from '../repositories/role.repository';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { CheckPasswordDto } from '../dtos/check-password.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { ResendActivationDto } from '../dtos/resend-activation.dto';
import { RegistrationDto } from '../dtos/registration.dto';
import { ActivationDto } from '../dtos/activation.dto';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import { generate } from 'randomstring';
import { TwoFactorAuthService } from './two-factor-auth.service';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
    private configService: ConfigService<ConfigVariables>,
    private notificationsService: NotificationsService,
    private usersService: UsersService,
    private twoFactorAuthService: TwoFactorAuthService,
    private rolesRepo: RolesRepository
  ) {}

  public async register(registrationDto: RegistrationDto): Promise<boolean> {
    const user = await this.usersService.getByEmail(registrationDto.email);
    if (user) {
      throw new ConflictException('Email address already used!');
    }

    let registerRequest = await this.authRepository.getRegisterRequest({
      email: registrationDto.email,
    });
    if (!registerRequest) {
      const expiresAt = moment()
        .add(
          this.configService.get('auth.registrationExpirationTime', {infer: true}),
          'hour'
        )
        .toDate();

      if (registrationDto.password) {
        registrationDto.password = await hash(
          registrationDto.password,
          this.configService.get('auth.passwordSalt', {infer: true})!
        );
      }

      registerRequest = await this.authRepository.saveRegisterRequest({
        emailAddress: registrationDto.email,
        registerData: JSON.stringify(registrationDto),
        verificationCode: generate(6).toUpperCase(),
        expiresAt,
      });
    }

    await this.notificationsService.userActivation(registerRequest);

    return true;
  }

  public async resendActivation(
    resendActivationDto: ResendActivationDto
  ): Promise<boolean> {
    const registerRequest = await this.authRepository.getRegisterRequest({
      email: resendActivationDto.email,
    });
    if (!registerRequest) {
      throw new ConflictException('Account not created! Please register!');
    }

    await this.notificationsService.userActivation(registerRequest);

    return true;
  }

  public async activate(activationDto: ActivationDto): Promise<User> {
    const registerRequest = await this.authRepository.getRegisterRequest(
      activationDto
    );
    if (!registerRequest) {
      throw new NotFoundException('Invalid verification code!');
    }

    try {
      const adminRole = await this.rolesRepo.findEntity({ where: { name: 'admin' } });
      const user = await this.usersService.create({
        ...registerRequest.registerObject,
        roles: [adminRole],
      });

      await this.updateRegisterStatus(registerRequest, RequestStatus.VALIDATED);
      await this.notificationsService.userWelcome(user);

      return user;
    } catch (error) {
      await this.updateRegisterStatus(registerRequest, RequestStatus.FAILED);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async getUserAuthenticationMode(
    user: User
  ) {
    return {
      password: !!user.password,
      tfa: await this.twoFactorAuthService.isUserTwoFactorAuthEnabled(user.id),
    };
  }

  public async sendLoginCode(email: string) {
    const user = await this.usersService.getByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const authorizationRequest =
      await this.authRepository.createEmailAuthenticationRequest({
        userId: user.id,
        code: generate(6).toUpperCase(),
        expiresAt: moment()
          .add(
            this.configService.get(
              'auth.emailAuthCodeExpirationTime', {infer: true}
            ),
            'minutes'
          )
          .toISOString(),
      });

    await this.notificationsService.loginAuthentication(
      user,
      authorizationRequest
    );

    return authorizationRequest;
  }

  public async validateUser(
    email: string,
    secret: string,
    loginAttempt: LoginAttempt
  ): Promise<{ user: User; authMode: {password: boolean, tfa: boolean} }> {
    const user = await this.usersService.getByEmail(email);
    if (user) {
      loginAttempt.userId = user.id;
      let isSecretValid = false;
      const authMode = await this.getUserAuthenticationMode(user);
      if (authMode.password) {
        isSecretValid = await compare(secret, user.password);
      } else {
        isSecretValid =
          !!(await this.authRepository.findEmailAuthenticationRequest({
            userId: user.id,
            code: secret,
            notExpired: true,
          }));
      }

      if (!isSecretValid) {
        await this.saveLoginAttempt(loginAttempt, AttemptStatus.FAILED);
        throw new BadRequestException('Wrong credentials provided');
      }

      await this.saveLoginAttempt(loginAttempt, AttemptStatus.SUCCESS);

      return { user, authMode };
    }

    await this.saveLoginAttempt(loginAttempt, AttemptStatus.FAILED);

    throw new BadRequestException('Wrong credentials provided');
  }

  public async validateRefreshToken(
    refreshToken: string,
    userId: string
  ): Promise<boolean> {
    const user = await this.usersService.getEntity(userId);
    if (!user?.refreshToken) {
      return false;
    }
    return compare(refreshToken, user.refreshToken);
  }

  public async getProfile(authUser: LoggedUser) {
    return this.usersService.getEntity(authUser.id);
  }

  public saveLoginAttempt(
    loginAttempt: LoginAttempt,
    status: AttemptStatus = AttemptStatus.SUBMITTED
  ) {
    return this.authRepository.saveLoginAttempt({
      ...loginAttempt,
      status,
    });
  }

  public async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto
  ): Promise<boolean> {
    const user = await this.usersService.getByEmail(forgotPasswordDto.email);
    if (user) {
      const expiresAt = moment()
        .add(
          this.configService.get('auth.forgotPasswordExpirationTime', {infer: true}),
          'hour'
        )
        .toISOString();

      const passwordRequest =
        await this.authRepository.createForgotPasswordRequest({
          userId: user.id,
          code: generate(6).toUpperCase(),
          expiresAt,
        });

      await this.notificationsService.resetPassword(user, passwordRequest);
    }

    return true;
  }

  public async checkPasswordRequest(
    checkRequestDto: CheckPasswordDto
  ): Promise<boolean> {
    const user = await this.usersService.getByEmail(checkRequestDto.email);
    if (!user) {
      throw new NotFoundException('Invalid request!');
    }

    const passwordRequest = await this.authRepository.getForgotPasswordRequest({
      id: checkRequestDto.id,
      userId: user.id,
      notExpired: true,
    });
    if (!passwordRequest) {
      throw new NotFoundException('Invalid request!');
    }

    return true;
  }

  public async resetPassword(resetPasswordDto: ResetPasswordDto) {
    let user = await this.usersService.getByEmail(resetPasswordDto.email);
    if (!user) {
      throw new BadRequestException('Invalid user!');
    }

    const passwordRequest = await this.authRepository.getForgotPasswordRequest({
      userId: user.id,
      code: resetPasswordDto.code,
      status: ResetPasswordStatus.SENT,
      notExpired: true,
    });

    if (!passwordRequest) {
      throw new BadRequestException('Invalid code!');
    }

    if (user.password) {
      const checkPass = await compare(
        resetPasswordDto.password,
        user.password
      );
      if (checkPass) {
        throw new BadRequestException(
          'Password should not match current password!'
        );
      }
    }

    if (await this.twoFactorAuthService.isUserTwoFactorAuthEnabled(user.id)) {
      if (!resetPasswordDto.tfaCode) {
        throw new UnauthorizedException(
          'Two factor authentication code is required!'
        );
      }

      if (
        !(await this.twoFactorAuthService.checkCodeForUser(
          user,
          resetPasswordDto.tfaCode
        ))
      ) {
        throw new UnauthorizedException(
          'Invalid two factor authorization code!'
        );
      }
    }

    try {
      const oldPasswordHash = user.password;

      user = await this.usersService.update(passwordRequest.userId, {
        password: resetPasswordDto.password,
      });

      await this.authRepository.updateForgotPasswordRequest(
        passwordRequest.id,
        {
          status: ResetPasswordStatus.PROCESSED,
          oldPasswordHash,
          newPasswordHash: user.password,
        }
      );

      await Promise.all([
        await this.authRepository.cancelActiveForgotPasswordRequests(user.id),
        await this.notificationsService.passwordResetConfirmation(user),
      ]);

      return user;
    } catch (e) {
      await this.authRepository.updateForgotPasswordRequest(
        passwordRequest.id,
        {
          status: ResetPasswordStatus.SENT,
        }
      );

      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public generateAccessToken(user: LoggedUser) {
    return this.generateJWT(
      user,
      {
        secret: this.configService.get('auth.secret', {infer:true})
      }
    );
  }

  public async generateRefreshToken(user: LoggedUser) {
    const refreshToken = this.generateJWT(
      user,
      {
        secret: this.configService.get('auth.secret', {infer:true})
      }
    );
    const hashedToken = await hash(refreshToken.token, this.configService.get('auth.refreshTokenSalt', {infer:true})!);
    await this.usersService.update(user.id, { refreshToken: hashedToken });
    return refreshToken;
  }

  public async getJwtTokens(user: LoggedUser, excludeRefreshToken = false) {
    const { token: accessToken, expiresAt: accessTokenExpiresAt } =
      this.generateAccessToken(user);

    const tokens: {
      accessToken: string;
      accessTokenExpiresAt: number;
      refreshToken?: string;
      refreshTokenExpiresAt?: number;
    } = {
      accessToken,
      accessTokenExpiresAt,
    };

    if (!excludeRefreshToken) {
      const { token: refreshToken, expiresAt: refreshTokenExpiresAt } =
        await this.generateRefreshToken(user);
      Object.assign(tokens, { refreshToken, refreshTokenExpiresAt });
    }

    return tokens;
  }

  public revokeTokens(user: LoggedUser) {
    return this.usersService.update(user.id, { refreshToken: undefined });
  }

  private generateJWT(
    user: LoggedUser,
    tokenData: Partial<JwtSignOptions>
  ): { token: string; expiresAt: number } {
    const payload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return {
      token: this.jwtService.sign(payload, tokenData),
      expiresAt: moment().add(tokenData.expiresIn, 'second').unix(),
    };
  }

  private updateRegisterStatus(
    registerRequest: RegisterRequest,
    status: RequestStatus
  ) {
    return this.authRepository.saveRegisterRequest({
      ...registerRequest,
      status,
    });
  }
}
