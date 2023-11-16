import { Column, Entity as DBEntity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Entity } from '@ehalca/db';

export enum TwoFactorAuthStatus {
  CREATED = 'created',
  ACTIVE = 'active',
  DISABLED = 'disabled'
}

export enum TwoFactorAuthType {
  EMAIL = 'email',
  SMS = 'sms',
  TOTP = 'totp'
}

@DBEntity()
export class TwoFactorAuthentication extends Entity{

  @Column()
  userId!: string;

  @Column({
    type: 'enum',
    enum: TwoFactorAuthStatus,
    default: TwoFactorAuthStatus.CREATED
  })
  public status!: TwoFactorAuthStatus;

  @Column({
    type: 'enum',
    enum: TwoFactorAuthType,
    default: TwoFactorAuthType.TOTP
  })
  public type!: TwoFactorAuthType;

  @Column()
  @Exclude()
  secret!: string;

  @Column({
    nullable: true
  })
  emailAddress!: string;

  @Column({
    nullable: true
  })
  phoneNumber!: string;

}
