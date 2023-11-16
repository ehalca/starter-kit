import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { ConfigService } from '@nestjs/config';
import {
  TwoFactorAuthentication,
  TwoFactorAuthStatus,
  TwoFactorAuthType
} from '../entities/two-factor-authentication.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersRepository } from '../repositories/users.repository';
import { User } from '../entities/user.entity';
import { CreateTwoFactorAuthDto } from '../dtos/create-two-factor-auth.dto';
import { UpdateTwoFactorAuthDto } from '../dtos/update-two-factor-auth.dto';
import {Response} from 'express';
import { compare } from 'bcrypt';

export interface TOTPResponse {
  entity: TwoFactorAuthentication;
  otpAuthUrl: string;
}

export type CreateTwoFactorAuth = TOTPResponse;

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UsersRepository,
    @InjectRepository(TwoFactorAuthentication) private twoFactorAuthRepository: Repository<TwoFactorAuthentication>
  ) {}

  public list(userId: string) {
    return this.twoFactorAuthRepository.find({ where:{userId} });
  }

  public isUserTwoFactorAuthEnabled(userId: string): Promise<boolean> {
    return this.twoFactorAuthRepository
      .findOne({ where:{userId, status: TwoFactorAuthStatus.ACTIVE }})
      .then((entity) => !!entity);
  }

  public async create(userId: string, dto: CreateTwoFactorAuthDto): Promise<CreateTwoFactorAuth> {
    const user = await this.checkUser(userId, dto.password);

    switch (dto.type) {
      case TwoFactorAuthType.TOTP: {
        return this.generateTOTP(user);
      }
      default: {
        throw new BadRequestException('Type not implemented!');
      }
    }
  }

  public async updateStatus(
    userId: string,
    dto: UpdateTwoFactorAuthDto,
    status: TwoFactorAuthStatus
  ): Promise<boolean> {
    const user = await this.checkUser(userId, dto.password);

    const entity = await this.twoFactorAuthRepository.findOne({ where:{userId: user.id, type: dto.type }});
    if (!entity) {
      throw new NotFoundException('Two factory auth type not found!');
    }

    await this.twoFactorAuthRepository.update(entity.id, { ...entity, status });

    return true;
  }

  public async pipeQrCodeStream(stream: Response, otpAuthUrl: string) {
    return toFileStream(stream, otpAuthUrl);
  }

  public async checkCodeForUser(user: User, code: string) {
    const entity = await this.twoFactorAuthRepository.findOne({ where:{userId: user.id, type: TwoFactorAuthType.TOTP }});
    if (!entity) {
      throw new NotFoundException();
    }

    return authenticator.verify({ token: code, secret: entity.secret });
  }

  private async checkUser(userId:string, password: string): Promise<User> {
    const user = await this.userRepository.getEntity(userId);
    if (!user) {
      throw new NotFoundException('User not found!');
    }

    if (!user.password) {
      throw new BadRequestException('No password configured!');
    }

    const checkPass = await compare(password, user.password);
    if (!checkPass) {
      throw new BadRequestException('Wrong password provided');
    }

    return user;
  }

  private async generateTOTP(user: User): Promise<TOTPResponse> {
    const secret = authenticator.generateSecret();

    const otpAuthUrl = authenticator.keyuri(user.email, this.configService.get('domain.appDomain', {infer:true})!, secret);

    const entity = await this.setTwoFactorAuthSecret(user, secret);

    return { entity, otpAuthUrl };
  }

  private async setTwoFactorAuthSecret(user: User, secret: string): Promise<TwoFactorAuthentication> {
    await this.disableAll(user.id);

    let entity = await this.twoFactorAuthRepository.findOne({ where:{userId: user.id, type: TwoFactorAuthType.TOTP }});
    if (!entity) {
      entity = await this.twoFactorAuthRepository.save({
        userId: user.id,
        status: TwoFactorAuthStatus.ACTIVE,
        type: TwoFactorAuthType.TOTP,
        emailAddress: user.email,
        secret
      });
    } else {
      entity.secret = secret;
      entity.status = TwoFactorAuthStatus.ACTIVE;
      await this.twoFactorAuthRepository.update(entity.id, { ...entity });
    }

    return entity;
  }

  private disableAll(userId: string) {
    return this.twoFactorAuthRepository
      .createQueryBuilder()
      .update()
      .set({ status: TwoFactorAuthStatus.DISABLED })
      .where('userId = :userId', { userId })
      .execute();
  }
}
