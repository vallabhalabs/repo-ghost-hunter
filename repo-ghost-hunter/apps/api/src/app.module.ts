import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { GitHubModule } from './modules/github/github.module';
import { ReposModule } from './modules/repos/repos.module';
import { IssuesModule } from './modules/issues/issues.module';
import { PullRequestsModule } from './modules/pullrequests/pullrequests.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { HealthModule } from './modules/health/health.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    AppConfigModule,
    ScheduleModule.forRoot(),
    DatabaseModule,
    HealthModule,
    AuthModule,
    GitHubModule,
    ReposModule,
    IssuesModule,
    PullRequestsModule,
    AnalyticsModule,
    ReportsModule,
    SchedulerModule,
  ],
})
export class AppModule {}
