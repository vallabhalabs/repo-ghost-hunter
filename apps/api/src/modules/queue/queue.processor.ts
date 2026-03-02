import { Processor, Process } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { SyncService } from '../sync/sync.service';
import { SyncUserJobData } from './queue.service';
import {
  GithubUnauthorizedException,
  GithubRateLimitException,
  GithubForbiddenException,
  GithubNotFoundException,
  GithubApiException,
} from '../github/exceptions/github.exceptions';

@Processor('repo-sync')
export class QueueProcessor {
  private readonly logger = new Logger(QueueProcessor.name);

  constructor(private readonly syncService: SyncService) {}

  @Process('sync-user')
  async handleSyncUserJob(job: Job<SyncUserJobData>) {
    const startTime = Date.now();
    const { userId } = job.data;

    this.logger.log(`Starting sync job ${job.id} for user: ${userId}`);

    try {
      // Update job progress
      await job.updateProgress(10);

      // Call the existing sync service
      const result = await this.syncService.syncUserRepositories(userId);
      
      await job.updateProgress(100);

      const duration = Date.now() - startTime;
      this.logger.log(
        `Sync job ${job.id} completed for user: ${userId} in ${duration}ms. ` +
        `Synced ${result.synced_count} repositories.`
      );

      return {
        success: true,
        userId,
        syncedCount: result.synced_count,
        duration,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error(
        `Sync job ${job.id} failed for user: ${userId} after ${duration}ms`,
        error.stack
      );

      // Handle specific GitHub errors
      if (error instanceof GithubRateLimitException) {
        this.logger.warn(`Rate limit exceeded for user ${userId}, job will retry`);
        throw error; // Let BullMQ handle retry
      } else if (error instanceof GithubUnauthorizedException) {
        this.logger.error(`Unauthorized access for user ${userId}, skipping retry`);
        throw error; // Still retry, but user needs to re-auth
      } else if (error instanceof GithubForbiddenException) {
        this.logger.error(`Forbidden access for user ${userId}, skipping retry`);
        throw error;
      } else if (error instanceof GithubNotFoundException) {
        this.logger.error(`Resource not found for user ${userId}, skipping retry`);
        throw error;
      } else {
        this.logger.error(`Unexpected error for user ${userId}: ${error.message}`);
        throw new GithubApiException(`Sync failed: ${error.message}`);
      }
    }
  }
}
