import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationService } from './notification.service';
import { NotificationProcessor } from './notification.processor';
import { NotificationScheduler } from './notification.scheduler';
import { NotificationController } from './notification.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationProcessor, NotificationScheduler],
  exports: [NotificationService],
})
export class NotificationModule {}
