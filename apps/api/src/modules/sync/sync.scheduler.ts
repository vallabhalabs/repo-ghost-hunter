import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueService } from '../queue/queue.service';
import { PrismaService } from '@repo/database';

@Injectable()
export class SyncScheduler implements OnModuleInit {
  private readonly logger = new Logger(SyncScheduler.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.logger.log('Sync Scheduler initialized');
  }

  // Run every 24 hours at 2 AM UTC
  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: 'daily-sync',
    timeZone: 'UTC',
  })
  async handleDailySync() {
    this.logger.log('Starting daily sync for all users');
    
    try {
      const stats = await this.queueService.getQueueStats();
      this.logger.log(`Queue stats before sync: ${JSON.stringify(stats)}`);
      
      const result = await this.queueService.triggerSyncForAllUsers();
      
      this.logger.log(`Daily sync triggered for ${result.length} users`);
      
      // Log queue stats after triggering
      setTimeout(async () => {
        const newStats = await this.queueService.getQueueStats();
        this.logger.log(`Queue stats after sync: ${JSON.stringify(newStats)}`);
      }, 5000);
      
    } catch (error) {
      this.logger.error('Daily sync failed:', error);
    }
  }

  // Health check endpoint for monitoring
  async getSchedulerHealth() {
    const queueStats = await this.queueService.getQueueStats();
    
    return {
      status: 'healthy',
      lastRun: new Date().toISOString(),
      queueStats,
      nextRun: this.getNextRunTime(),
    };
  }

  private getNextRunTime(): string {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setUTCHours(2, 0, 0, 0); // 2 AM UTC
    
    return tomorrow.toISOString();
  }
}
