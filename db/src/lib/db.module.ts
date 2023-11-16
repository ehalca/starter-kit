import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigVariables } from '@ehalca/config';

@Module({
  imports: [
    
  ],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class DbModule {}
