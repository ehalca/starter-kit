import { Column, Entity as DBEntity, PrimaryGeneratedColumn } from 'typeorm';
import { PermissionOwner } from '@ehalca/common';
import { Entity } from '@ehalca/db';

@DBEntity('permissions_assigned')
export class PermissionAssigned extends Entity{

  @Column({
    type: 'enum',
    enum: PermissionOwner,
    default: PermissionOwner.ROLE
  })
  public ownerType!: PermissionOwner;

  @Column({ type: 'uuid' })
  public ownerId!: string;

  @Column({ type: 'uuid' })
  public permissionId!: string;
}
