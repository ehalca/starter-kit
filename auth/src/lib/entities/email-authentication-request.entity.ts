import {
  Column,
  CreateDateColumn,
  Entity as DBEntity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Entity } from '@ehalca/db';

@DBEntity()
export class EmailAuthenticationRequest extends Entity {
  @Column()
  code!: string;

  @Column()
  userId!: string;

  @Column({
    type: 'timestamp',
  })
  expiresAt!: Date;
}
