import { FindOneOptions, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { AbstractRepository } from '@ehalca/db';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UsersRepository extends AbstractRepository<User> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManager: Cache,
    @InjectRepository(User) dbRepository: Repository<User>,
  ) {
    super(cacheManager, dbRepository);
  }

  public get entity() {
    return User;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const cacheKey = this.makeCacheKey(`email:${encodeURIComponent(email)}`);
    const userId = (await this.cacheManager.get(cacheKey)) as string;
    const entity = await this.getEntity(userId, () => this.dbRepository.findOne({ where: { email } }));
    if (!userId && entity) {
      await this.cacheManager.set(cacheKey, entity.id);
    }

    return entity;
  }

  protected override getModelFromDB(id: string): Promise<User | null> {
    return this.dbRepository.findOne({ where: { id }} as FindOneOptions<User>);
  }
}
