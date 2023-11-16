import { Role } from '../entities/role.entity';
import { AbstractRepository } from '@ehalca/db';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class RolesRepository extends AbstractRepository<Role> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManager: Cache,
    @InjectRepository(Role) dbRepository: Repository<Role>
  ) {
    super(cacheManager, dbRepository);
  }

  public get entity() {
    return Role;
  }
}
