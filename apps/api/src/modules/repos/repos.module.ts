import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReposController } from './repos.controller';
import { ReposService } from './repos.service';
import { Repository } from '../../database/entities/repository.entity';
import { GitHubModule } from '../github/github.module';

@Module({
  imports: [TypeOrmModule.forFeature([Repository]), GitHubModule],
  controllers: [ReposController],
  providers: [ReposService],
  exports: [ReposService],
})
export class ReposModule {}
