import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class Entity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  getEntityName(): string {
    return this.constructor.name.toLocaleLowerCase();
  }

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  constructor(partial?: Partial<Entity>) {
    this.id = partial?.id || '';
    this.createdAt = partial?.createdAt || new Date();
    this.updatedAt = partial?.updatedAt || new Date();
  }
}
