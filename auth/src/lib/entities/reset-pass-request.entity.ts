import { Exclude } from 'class-transformer';
import { Column, Entity as DBEntity, PrimaryGeneratedColumn } from 'typeorm';
import { Entity } from '@ehalca/db';

export enum ResetPasswordStatus {
  SENT = 'sent',
  CANCELLED = 'cancelled',
  PROCESSED = 'processed',
}

@DBEntity()
export class ResetPasswordRequest extends Entity {
  @Column()
  userId!: string;

  @Column()
  code!: string;

  @Column({
    type: 'enum',
    enum: ResetPasswordStatus,
    default: ResetPasswordStatus.SENT,
  })
  public status!: ResetPasswordStatus;

  @Column({
    type: 'timestamp',
  })
  expiresAt!: Date;

  @Column({ nullable: true })
  @Exclude()
  oldPasswordHash!: string;

  @Column({ nullable: true })
  @Exclude()
  newPasswordHash!: string;
}
