import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GitHubModule } from './modules/github/github.module';
import { SyncModule } from './modules/sync/sync.module';
import { QueueModule } from './modules/queue/queue.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ReposModule } from './modules/repos/repos.module';
import { IssuesModule } from './modules/issues/issues.module';
import { PullRequestsModule } from './modules/pullrequests/pullrequests.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { HealthModule } from './modules/health/health.module';
import { DatabaseModule } from '@repo/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: () => {
        // Environment validation will be handled in AuthModule
        return {};
      },
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    GitHubModule,
    SyncModule,
    QueueModule,
    NotificationModule,
    ReposModule,
    IssuesModule,
    PullRequestsModule,
    AnalyticsModule,
    ReportsModule,
    SchedulerModule,
  ],
})
export class AppModule {}
