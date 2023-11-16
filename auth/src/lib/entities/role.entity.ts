import { Column, Entity as DbEntity, PrimaryGeneratedColumn } from 'typeorm';
import { Entity } from '@ehalca/db';

@DbEntity()
export class Role extends Entity {
  @Column()
  name!: string;
}
