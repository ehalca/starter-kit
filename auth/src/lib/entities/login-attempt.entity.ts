import { Column, Entity as DBEntity, PrimaryGeneratedColumn } from 'typeorm';
import { Entity } from '@ehalca/db';

export enum AttemptStatus {
  SUBMITTED = 'submitted',
  SUCCESS = 'success',
  FAILED = 'failed'
}

@DBEntity()
export class LoginAttempt extends Entity {

  @Column()
  public emailAddress!: string;

  @Column({ default: null })
  public userId!: string;

  @Column({ default: null })
  public ipAddress!: string;

  @Column({ default: null })
  public userAgent!: string;

  @Column({
    type: 'enum',
    enum: AttemptStatus,
    default: AttemptStatus.SUBMITTED
  })
  public status!: AttemptStatus;


}
