import { MixinConstructor } from '@ehalca/common';
import { BasePolicy } from '../base.policy';

export const ViewPermissionsMixin = <
  T extends MixinConstructor<BasePolicy<U>>,
  U = unknown
>(
  superclass: T
) =>
  class extends superclass {
    public viewList() {
      const permissions = this.getPermissionsByPath('view');
      return (
        this.isBool(permissions) ||
        this.get(permissions, 'all') ||
        this.get(permissions, 'own')
      );
    }

    public view(resource: U) {
      return this.canViewResource(resource);
    }

    public canViewResource(resource: U) {
      return this.hasPermission('view', resource);
    }
  };
