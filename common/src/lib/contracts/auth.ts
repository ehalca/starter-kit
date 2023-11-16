export enum Roles {
  ADMIN = 1,
  USER = 2,
}

export enum Entities {
  USER = 'user',
}

export enum PermissionOwner {
  ROLE = 'role',
  USER = 'user',
}

export interface UserPermission {
  id: number;
  name: string;
  readonly: boolean;
}

export enum Action {
  Manage = 'manage',
  Create = 'create',

  ViewList = 'viewList',
  View = 'view',

  Update = 'update',
  Destroy = 'destroy',

  //Custom Permissions
  //   PERMISION_TYPE = 'permisionType',
}

export type PermissionEffect = boolean | { all?: boolean; own?: boolean };

export type ActionPermission = {
  [key in Action]: PermissionEffect;
};

export type UserAppPermission = {
  [key in Entities]: ActionPermission;
};

export interface LoggedUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  permissions: UserAppPermission;
}




