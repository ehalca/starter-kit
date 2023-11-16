import { Column, Entity as DBEntity } from 'typeorm';
import { Entity } from '@ehalca/db';

@DBEntity()
export class Permission extends Entity {
  @Column()
  name!: string;

  @Column()
  description!: string;
}
