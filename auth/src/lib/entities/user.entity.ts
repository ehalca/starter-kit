import { Entity } from '@ehalca/db';
import { Exclude } from 'class-transformer';
import {
  Column,
  Entity as DBEntity, JoinTable,
  ManyToMany
} from 'typeorm';
import { Role } from './role.entity';

@DBEntity()
export class User extends Entity {

  @Column({ unique: true })
  email!: string;

  @Exclude({
    toPlainOnly: true
  })
  @Column({
    nullable: true
  })
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({
    nullable: true
  })
  company!: string;

  @Column({ default: false })
  termsAgreement!: boolean;

  @Column({ default: false })
  securityAgreement!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  profilePictureId!: string;

  @Column({
    nullable: true
  })
  linkedIn!: string;

  @Column({
    nullable: true,
    length: 15
  })
  phone!: string;

  @Column({
    nullable: true
  })
  @Exclude({
    toPlainOnly: true
  })
  refreshToken?: string;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'roleId',
      referencedColumnName: 'id'
    }
  })
  roles!: Role[];

}
