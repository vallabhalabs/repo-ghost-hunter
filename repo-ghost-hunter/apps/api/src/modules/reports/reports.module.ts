import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReposModule } from '../repos/repos.module';
import { IssuesModule } from '../issues/issues.module';
import { PullRequestsModule } from '../pullrequests/pullrequests.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [ReposModule, IssuesModule, PullRequestsModule, AnalyticsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
