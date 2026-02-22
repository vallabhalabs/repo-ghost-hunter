import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerService } from './scheduler.service';
import { ReposModule } from '../repos/repos.module';
import { IssuesModule } from '../issues/issues.module';
import { PullRequestsModule } from '../pullrequests/pullrequests.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { ReportsModule } from '../reports/reports.module';
import { User } from '../../database/entities/user.entity';
import { Repository } from '../../database/entities/repository.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Repository]),
    ReposModule,
    IssuesModule,
    PullRequestsModule,
    AnalyticsModule,
    ReportsModule,
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
