import { each, map, set } from 'lodash';
import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Permission } from '../entities/permission.entity';
import { PermissionAssigned } from '../entities/permission-assigned.entity';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { plainToInstance } from 'class-transformer';
import { AbstractListingOptions, AbstractRepository } from '@ehalca/db';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PermissionOwner, UserAppPermission, UserPermission } from '@ehalca/common';

@Injectable()
export class PermissionsRepository extends AbstractRepository<Permission> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManager: Cache,
    @InjectRepository(Permission) dbRepository: Repository<Permission>,
    @InjectRepository(PermissionAssigned) private assignRepository: Repository<PermissionAssigned>
  ) {
    super(cacheManager, dbRepository);
  }

  public get entity() {
    return Permission;
  }

  public override list(options?: AbstractListingOptions): Promise<Permission[]> {
    const fetchList = (listOptions?: AbstractListingOptions) => this.getBuilder(listOptions).getMany();
    if (options) {
      return fetchList(options);
    } else {
      return this.rememberValue('list', () => fetchList(options));
    }
  }

  public getRolePermissions(id: string): Promise<Array<Permission>> {
    const fetchList = () =>
      this.assignRepository
        .createQueryBuilder('permissions_assigned')
        .select(['permission.id as id', 'permission.name as name'])
        .innerJoin(Permission, 'permission', 'permission.id = permissions_assigned.permissionId')
        .where('permissions_assigned.ownerType = :ownerType', { ownerType: PermissionOwner.ROLE })
        .andWhere('permissions_assigned.ownerId = :ownerId', { ownerId: id })
        .getRawMany();

    return this.rememberValue(`role:${id}:permissions`, () => fetchList());
  }

  public async getUserPermissions(id: string): Promise<Array<UserPermission>> {
    const fetchList = () =>
      this.assignRepository
        .createQueryBuilder('permissions_assigned')
        .select(['permission.id as id', 'permission.name as name'])
        .innerJoin(Permission, 'permission', 'permission.id = permissions_assigned.permissionId')
        .where(
          `
            (permissions_assigned.ownerType = :ownerUser and permissions_assigned.ownerId = :userId) OR
            (permissions_assigned.ownerType = :ownerRole and permissions_assigned.ownerId IN (select "user_roles"."roleId" from "user_roles" where "user_roles"."userId" = :userId))
        `
        )
        .groupBy('permission.id')
        .setParameters({ ownerUser: PermissionOwner.USER, ownerRole: PermissionOwner.ROLE, userId: id })
        .getRawMany();

    return this.rememberValue(`user:${id}:permissions`, () => fetchList());
  }

  public getUserAppPermissions(id: string): Promise<UserAppPermission> {
    const fetchList = async () => {
      const list = await this.getUserPermissions(id);
      const permissions = {};

      each(list, (permission) => {
        set(permissions, permission.name, true);
      });

      return permissions;
    };

    return this.rememberValue(`user:${id}:permissions:app`, () => fetchList());
  }

  public async assignPermission(data: DeepPartial<PermissionAssigned>): Promise<PermissionAssigned> {
    const response = await this.assignRepository.save(data);

    return plainToInstance(PermissionAssigned, response);
  }

  public async unAssignPermissions(roleId: string){
    await this.assignRepository.delete({ ownerId: roleId, ownerType: PermissionOwner.ROLE });
  }
}
