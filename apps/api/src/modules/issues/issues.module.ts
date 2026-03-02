import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';
import { Issue } from '../../database/entities/issue.entity';
import { GitHubModule } from '../github/github.module';

@Module({
  imports: [TypeOrmModule.forFeature([Issue]), GitHubModule],
  controllers: [IssuesController],
  providers: [IssuesService],
  exports: [IssuesService],
})
export class IssuesModule {}
