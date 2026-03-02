import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, QueueEvents, Worker } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@repo/database';

export interface SyncUserJobData {
  userId: string;
}

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private readonly queueEvents: QueueEvents;
  private worker: Worker;

  constructor(
    @InjectQueue('repo-sync') private readonly repoSyncQueue: Queue,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.queueEvents = new QueueEvents('repo-sync', {
      connection: {
        url: this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
      },
    });
  }

  async onModuleInit() {
    this.logger.log('Queue Service initialized');
    
    // Set up queue event listeners
    this.setupQueueEventListeners();
    
    // Create worker with concurrency control
    this.worker = new Worker(
      'repo-sync',
      async (job) => {
        this.logger.log(`Processing job ${job.id} for user ${job.data.userId}`);
        return job.data;
      },
      {
        connection: {
          url: this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
        },
        concurrency: 3,
        limiter: {
          max: 10,
          duration: 60000, // 1 minute
        },
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} completed for user ${job.data.userId}`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job.id} failed for user ${job.data.userId}: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    this.logger.log('Queue Service shutting down');
    
    await this.worker.close();
    await this.queueEvents.close();
    await this.repoSyncQueue.close();
  }

  private setupQueueEventListeners() {
    this.queueEvents.on('completed', ({ jobId, returnvalue }) => {
      this.logger.log(`Job ${jobId} completed with result:`, returnvalue);
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      this.logger.error(`Job ${jobId} failed: ${failedReason}`);
    });

    this.queueEvents.on('progress', ({ jobId, data }) => {
      this.logger.log(`Job ${jobId} progress: ${data}%`);
    });
  }

  async addSyncUserJob(userId: string, options: { delay?: number; priority?: number } = {}) {
    this.logger.log(`Adding sync job for user: ${userId}`);
    
    return this.repoSyncQueue.add(
      'sync-user',
      { userId } as SyncUserJobData,
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
        ...options,
      },
    );
  }

  async getQueueStats() {
    const waiting = await this.repoSyncQueue.getWaiting();
    const active = await this.repoSyncQueue.getActive();
    const completed = await this.repoSyncQueue.getCompleted();
    const failed = await this.repoSyncQueue.getFailed();
    const delayed = await this.repoSyncQueue.getDelayed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      total: waiting.length + active.length + completed.length + failed.length + delayed.length,
    };
  }

  async pauseQueue() {
    this.logger.log('Pausing queue');
    await this.repoSyncQueue.pause();
  }

  async resumeQueue() {
    this.logger.log('Resuming queue');
    await this.repoSyncQueue.resume();
  }

  async clearQueue() {
    this.logger.log('Clearing queue');
    await this.repoSyncQueue.clean(0, 0, 'completed');
    await this.repoSyncQueue.clean(0, 0, 'failed');
  }

  async triggerSyncForAllUsers() {
    this.logger.log('Triggering sync for all users');
    
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });

    const jobs = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const delay = i * 2000; // Stagger jobs by 2 seconds
      
      const job = await this.addSyncUserJob(user.id, { delay });
      jobs.push({ userId: user.id, jobId: job.id, delay });
    }

    this.logger.log(`Added ${jobs.length} sync jobs to queue`);
    return jobs;
  }
}
