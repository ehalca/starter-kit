import { NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { kebabCase } from 'lodash';
import {
  DeepPartial,
  Equal,
  FindOneOptions,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Entity } from '../entities/abstract-entity';
import { AbstractListingOptions } from '../listings/abstract.listing-options';
import { Pagination } from '../listings/abstract.pagination-result';
type ListCacheKey<E> = 'all' | keyof E;

export abstract class AbstractRepository<E extends Entity> {
  protected namespace = '';

  protected constructor(
    protected cacheManager: Cache,
    protected dbRepository: Repository<E>
  ) {}

  protected get repoCacheKey(): string {
    return (
      (this.namespace ? `${this.namespace}:` : '') +
      kebabCase(this.constructor.name)
    );
  }

  public abstract get entity(): { new (): E };

  public list(options?: AbstractListingOptions): Promise<E[]> {
    return this.getBuilder(options).getMany();
  }

  public async paginate(options: AbstractListingOptions) {
    const [results, total] = await this.getBuilder(options)
      .skip((options.page - 1) * options.perPage)
      .take(options.perPage)
      .getManyAndCount();

    return new Pagination<E>({
      results,
      total,
    });
  }

  public async getEntity(
    id: string | null = null,
    customFetch: ((...any: any[]) => Promise<E | null>) | null = null
  ): Promise<E | null> {
    if (!id && !customFetch) {
      throw new Error('Invalid arguments!');
    }
    if (id) {
      const cacheKey = this.getEntityCacheKey(id);
      const cachedValue = await this.cacheManager.get(cacheKey);
      if (cachedValue) {
        return plainToInstance(this.entity, cachedValue);
      }
    }
    const fallback = customFetch || ((id) => this.getModelFromDB(id));
    const entity = await fallback(id);
    if (entity) {
      await this.addEntityToCache(entity);
    }

    return entity;
  }

  public getEntities(ids: string[]): Promise<E[]> {
    return this.dbRepository.findByIds(ids);
  }

  public async findEntity(options: FindOneOptions<E>): Promise<E | null> {
    if (!options) {
      throw new NotFoundException('Invalid query value!');
    }

    return this.dbRepository.findOne(options);
  }

  public async create(data: DeepPartial<E>): Promise<E> {
    const response = await this.dbRepository.save(data);

    return plainToInstance(this.entity, response);
  }

  public async update(id: string, data: DeepPartial<E>): Promise<E> {
    const entity = await this.getEntity(id);
    if (!entity) {
      throw new NotFoundException();
    }

    await this.clearEntityFromCache(id);
    const response = await this.dbRepository.save({
      ...entity,
      ...data,
    });

    return plainToInstance(this.entity, response);
  }

  public async destroy(id: string): Promise<any> {
    const entity = await this.getEntity(id);
    if (!entity) {
      throw new NotFoundException();
    }

    await this.clearEntityFromCache(id);

    return this.delete(id);
  }

  protected delete(id: string) {
    return this.dbRepository.delete(id);
  }

  protected getBuilder(
    options?: AbstractListingOptions
  ): SelectQueryBuilder<E> {
    const builder = this.dbRepository.createQueryBuilder();
    if (options) {
      this.addSearchRules(builder, options);
      this.addOrderBy(builder, options);
    }

    return builder;
  }

  protected addOrderBy(
    builder: SelectQueryBuilder<E>,
    options?: AbstractListingOptions
  ) {
    if (options?.sortBy) {
      builder = builder.orderBy(options.sortBy, options.sortDir);
    }
    return builder;
  }

  protected addSearchRules(
    builder: SelectQueryBuilder<E>,
    options: AbstractListingOptions
  ) {
    //   let { searchCol } = options;
    //   const { searchRule, query } = options;
    //   if (searchCol && query) {
    //     if (!isArray(searchCol)) {
    //       searchCol = [searchCol];
    //     }

    //     const getSearchRule = this.getSearchRule.bind(this);

    //     builder = builder.where(() => {
    //       each(searchCol , (column, index: number) => {
    //         const { builder: queryBuilder, param, paramValue } = getSearchRule(column, searchRule, query);

    //         const method = index === 0 ? 'where' : 'orWhere';
    //         builder[method](queryBuilder(builder.alias)).setParameter(param, paramValue);
    //       });
    //     });
    //   }

    return builder;
  }

  protected async rememberValue(key: string, fetch: () => any): Promise<any> {
    key = this.makeCacheKey(key);

    let data = await this.cacheManager.get(key);
    if (!data) {
      data = await fetch();
      await this.cacheManager.set(key, data);
    }

    return data;
  }

  // protected getSearchRule(column:string, searchRule:string, searchValue:string) {
  //   return (isString(column) ? SearchBy.make(column, searchRule) : SearchBy.make(column.column, column.type)).getData(
  //     searchValue
  //   );
  // }

  protected getEntityCacheKey(id: string) {
    return `${this.repoCacheKey}:${this.entity.name}:${id}`.toLowerCase();
  }

  protected clearEntityFromCache(id: string) {
    return this.cacheManager.del(this.getEntityCacheKey(id));
  }

  protected makeCacheKey(name: string) {
    return `${this.repoCacheKey}:${name}`;
  }

  protected getModelFromDB(id: string) {
    return this.dbRepository.findOne({
      where: {
        id: Equal(id),
      },
    } as unknown as FindOneOptions<E>);
  }

  protected addEntityToCache(entity: E) {
    return this.cacheManager.set(
      this.getEntityCacheKey(entity.id),
      this.getCacheValue(entity)
    );
  }

  protected getCacheValue(entity: E) {
    return instanceToPlain(entity, { ignoreDecorators: true });
  }

  protected rememberListValues(
    listKey: ListCacheKey<E>,
    fetch: () => Promise<E[]>
  ) {
    return this.rememberValue(`list:${String(listKey)}`, async () => {
      const data = await fetch();
      return data.map((entity) => {
        return this.getCacheValue(entity);
      });
    });
  }
}
