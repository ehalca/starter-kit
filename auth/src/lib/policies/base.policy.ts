import { get, isBoolean } from 'lodash';
import { ActionPermission, LoggedUser, PermissionEffect } from '@ehalca/common';

export class BasePolicy<T> {
  public constructor(
    public readonly user: LoggedUser,
    public readonly permissions: ActionPermission
  ) {}

  public getPermissionsByPath(path: string) {
    return this.get(this.permissions, path);
  }

  public hasPermission(name: string, resource: T): boolean {
    const permission = this.getPermissionsByPath(name);
    if (!permission) {
      return false;
    }

    return (
      this.isBool(permission) ||
      permission.all ||
      (!!permission.own && this.isOwner(resource))
    );
  }

  public isOwner(_resource: T): boolean {
    throw new Error('Not implemented');
  }

  public get(
    value: ActionPermission | PermissionEffect,
    path: string,
    defaultValue:unknown = false
  )  {
    return get(value, path, defaultValue) as PermissionEffect;
  }

  public isBool(value: PermissionEffect): value is boolean {
    return isBoolean(value) && value === true;
  }
}
