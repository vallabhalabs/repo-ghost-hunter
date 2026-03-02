import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ActivityLog } from '../../database/entities/activitylog.entity';
import { Repository } from '../../database/entities/repository.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog, Repository])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
