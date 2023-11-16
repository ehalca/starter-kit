import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterRequest, RequestStatus } from '../entities/register-request.entity';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { ResetPasswordRequest, ResetPasswordStatus } from '../entities/reset-pass-request.entity';
import { AttemptStatus, LoginAttempt } from '../entities/login-attempt.entity';
import { EmailAuthenticationRequest } from '../entities/email-authentication-request.entity';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(RegisterRequest) private registerRepository: Repository<RegisterRequest>,
    @InjectRepository(ResetPasswordRequest) private forgotPassRepository: Repository<ResetPasswordRequest>,
    @InjectRepository(LoginAttempt) private attemptRepository: Repository<LoginAttempt>,
    @InjectRepository(EmailAuthenticationRequest)
    private emailAuthenticationRepository: Repository<EmailAuthenticationRequest>
  ) {}

  /** BEGIN REGISTER REQUESTS **/
  public async getRegisterRequest({
    code,
    email
  }: {
    code?: string;
    email?: string;
  }): Promise<RegisterRequest | null> {
    let builder = this.registerRepository
      .createQueryBuilder('requests')
      .where('requests.status <> :status', { status: RequestStatus.VALIDATED })
      .andWhere('requests.expiresAt >= NOW()');

    if (code) {
      builder = builder.andWhere('requests.verificationCode = :code', { code });
    }

    if (email) {
      builder = builder.andWhere('requests.emailAddress = :email', { email });
    }

    return builder.getOne();
  }

  public saveRegisterRequest(data: DeepPartial<RegisterRequest>): Promise<RegisterRequest> {
    return this.registerRepository.save(data);
  }

  /** END REGISTER REQUESTS **/

  /** BEGIN FORGOT PASSWORD  **/
  public getForgotPasswordRequest({
    userId,
    id,
    code,
    status,
    notExpired
  }: {
    userId: string;
    id?: string;
    code?: string;
    status?: ResetPasswordStatus;
    notExpired?: boolean;
  }) {
    let builder = this.forgotPassRepository
      .createQueryBuilder('requests')
      .where('requests.userId = :userId', { userId });

    if (id) {
      builder = builder.andWhere('requests.id = :id', { id });
    }

    if (code) {
      builder = builder.andWhere('requests.code = :code', { code });
    }

    if (notExpired) {
      builder = builder.andWhere('requests.expiresAt >= NOW()');
    }

    return builder.getOne();
  }

  public createForgotPasswordRequest(data: DeepPartial<ResetPasswordRequest>) {
    return this.forgotPassRepository.save(data);
  }

  public updateForgotPasswordRequest(id: string, data: DeepPartial<ResetPasswordRequest>) {
    return this.forgotPassRepository.update(id, data);
  }

  public cancelActiveForgotPasswordRequests(userId: string) {
    return this.forgotPassRepository.update(
      { userId, status: ResetPasswordStatus.SENT },
      { status: ResetPasswordStatus.CANCELLED }
    );
  }

  /** END FORGOT PASSWORD **/

  /** BEGIN LOGIN ATTEMPTS **/
  public getLoginAttempt(email: string): Promise<LoginAttempt | null> {
    return this.attemptRepository
      .createQueryBuilder('attempts')
      .where('attempts.status = :status', { status: AttemptStatus.SUBMITTED })
      .andWhere('attempts.emailAddress = :email', { email })
      .getOne();
  }

  public saveLoginAttempt(data: DeepPartial<LoginAttempt>): Promise<LoginAttempt> {
    return this.attemptRepository.save(data);
  }

  /** END LOGIN ATTEMPTS **/

  /** BEGIN Email Authorization Requests **/
  public findEmailAuthenticationRequest({
    userId,
    code,
    notExpired
  }: {
    userId: string;
    code: string;
    notExpired?: boolean;
  }) {
    let builder = this.emailAuthenticationRepository
      .createQueryBuilder('requests')
      .where('requests.userId = :userId', { userId });

    if (code) {
      builder = builder.andWhere('requests.code = :code', { code });
    }

    if (notExpired) {
      builder = builder.andWhere('requests.expiresAt >= NOW()');
    }

    return builder.getOne();
  }

  public createEmailAuthenticationRequest(data: DeepPartial<EmailAuthenticationRequest>) {
    return this.emailAuthenticationRepository.save(data);
  }

  /** END Email Authorization Requests **/
}
