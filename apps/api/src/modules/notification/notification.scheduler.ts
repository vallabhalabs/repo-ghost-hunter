import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from './notification.service';
import { PrismaService } from '@repo/database';

@Injectable()
export class NotificationScheduler implements OnModuleInit {
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.logger.log('Notification Scheduler initialized');
  }

  // Run every Sunday at 08:00 UTC
  @Cron('0 8 * * 0', {
    name: 'weekly-report',
    timeZone: 'UTC',
  })
  async handleWeeklyReports() {
    this.logger.log('Starting weekly reports for all users');
    
    try {
      const result = await this.notificationService.triggerWeeklyReportsForAllUsers();
      
      this.logger.log(`Weekly reports triggered for ${result.length} users`);
      
      // Log queue stats after triggering (with delay)
      setTimeout(async () => {
        // Note: We could add queue stats logging here if needed
        this.logger.log('Weekly reports job scheduling completed');
      }, 5000);
      
    } catch (error) {
      this.logger.error('Weekly reports scheduling failed:', error);
    }
  }

  async getSchedulerHealth() {
    return {
      status: 'healthy',
      lastRun: new Date().toISOString(),
      nextRun: this.getNextRunTime(),
      smtpConfigured: this.notificationService.isSmtpConfigured(),
    };
  }

  private getNextRunTime(): string {
    const now = new Date();
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setUTCHours(8, 0, 0, 0); // 8 AM UTC
    
    return nextSunday.toISOString();
  }
}
