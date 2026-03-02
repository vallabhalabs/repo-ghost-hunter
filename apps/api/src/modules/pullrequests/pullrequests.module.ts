import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PullRequestsController } from './pullrequests.controller';
import { PullRequestsService } from './pullrequests.service';
import { PullRequest } from '../../database/entities/pullrequest.entity';
import { GitHubModule } from '../github/github.module';

@Module({
  imports: [TypeOrmModule.forFeature([PullRequest]), GitHubModule],
  controllers: [PullRequestsController],
  providers: [PullRequestsService],
  exports: [PullRequestsService],
})
export class PullRequestsModule {}
