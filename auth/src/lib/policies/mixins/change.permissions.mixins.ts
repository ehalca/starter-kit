import { MixinConstructor } from '@ehalca/common';
import { BasePolicy } from '../base.policy';

export const ChangePermissionsMixins = <
  T extends MixinConstructor<BasePolicy<U>>,
  U = unknown
>(
  superclass: T
) =>
  class extends superclass {
    public create(): boolean {
      return this.isBool(this.getPermissionsByPath('create'));
    }

    public update(resource: U): boolean {
      return this.canUpdateResource(resource);
    }

    public destroy(resource: U): boolean {
      return this.canDestroyResource(resource);
    }

    canUpdateResource(resource: U): boolean {
      return this.hasPermission('update', resource);
    }

    canDestroyResource(resource: U): boolean {
      return this.hasPermission('destroy', resource);
    }
  };
