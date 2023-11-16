import { Injectable, OnModuleInit } from '@nestjs/common';
import { each } from 'lodash';
import { PermissionOwner } from '@ehalca/common';
import { User } from '../entities/user.entity';
import { PermissionsRepository } from '../repositories/permissions.repository';
import { RolesRepository } from '../repositories/role.repository';

@Injectable()
export class AuthSeederService implements OnModuleInit {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly permissionsRepository: PermissionsRepository,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedPermissions();
  }

  async seedRoles() {
    const roles = [{ name: 'Admin' }, { name: 'User' }];
    for (const role of roles) {
      if (!await this.rolesRepository.findEntity({ where: { name: role.name } })) {
          await this.rolesRepository.create(role);
      }
    }
  }

  async seedPermissions() {
    // await this.connection.query('truncate table "permissions_assigned"');
    // await this.connection.query('truncate table "permission"');
    // await this.cacheManager.reset();

    for (const permission of [
      // users
      { name: `${User.name}.create`, description: 'create user' },
      { name: `${User.name}.view.own`, description: 'view own user' },
      { name: `${User.name}.update.own`, description: 'update own user' },
    ]) {
      const currentPermission = await this.permissionsRepository.findEntity({ where: { name: permission.name } });
        if (!currentPermission) {
            await this.permissionsRepository.create(permission);
        }else{
            await this.permissionsRepository.update(currentPermission.id, permission);
        }
    }

    const permissionsMap = new Map();
    const permissions = await this.permissionsRepository.list();

    permissions.forEach((permission) => {
      permissionsMap.set(permission.name, permission.id);
    });

    const getIds = (codes = []) => {
      const list: Array<string> = [];
      if (codes.length) {
        each(codes, (code) => {
          const id = permissionsMap.get(code);
          if (id) {
            list.push(id);
          }
        });
      } else {
        permissionsMap.forEach((id) => {
          list.push(id);
        });
      }

      return list;
    };

    const adminRole = await this.rolesRepository.findEntity({where:{ name: 'Admin' }});
    if (adminRole) {
        await this.permissionsRepository.unAssignPermissions(adminRole.id);
        for (const permissionId of getIds()) {
          await this.permissionsRepository.assignPermission({
            ownerType: PermissionOwner.ROLE,
            ownerId: adminRole.id,
            permissionId,
          });
        }
    }
  }
}
