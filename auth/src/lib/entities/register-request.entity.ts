import { Column, Entity as DBEntity, PrimaryGeneratedColumn } from 'typeorm';
import { Entity } from '@ehalca/db';

export enum RequestStatus {
  CREATED = 'created',
  VALIDATED = 'validated',
  FAILED = 'failed',
}

@DBEntity()
export class RegisterRequest extends Entity{
  @Column()
  emailAddress!: string;

  @Column()
  registerData!: string;

  @Column()
  verificationCode!: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.CREATED,
  })
  public status!: RequestStatus;

  @Column({
    type: 'timestamp',
  })
  public expiresAt!: Date;

  get registerObject(): any {
    return this.registerData ? JSON.parse(this.registerData) : null;
  }
}
