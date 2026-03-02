import { 
  Controller, 
  Post, 
  Get, 
  HttpCode, 
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('queue')
@UseGuards(JwtAuthGuard)
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  async triggerSync(@CurrentUser() user: any) {
    const job = await this.queueService.addSyncUserJob(user.id);
    return {
      message: 'Sync job added to queue',
      jobId: job.id,
      userId: user.id,
    };
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getQueueStats() {
    return this.queueService.getQueueStats();
  }

  @Post('pause')
  @HttpCode(HttpStatus.OK)
  async pauseQueue() {
    await this.queueService.pauseQueue();
    return { message: 'Queue paused' };
  }

  @Post('resume')
  @HttpCode(HttpStatus.OK)
  async resumeQueue() {
    await this.queueService.resumeQueue();
    return { message: 'Queue resumed' };
  }

  @Post('clear')
  @HttpCode(HttpStatus.OK)
  async clearQueue() {
    await this.queueService.clearQueue();
    return { message: 'Queue cleared' };
  }

  @Post('trigger-all')
  @HttpCode(HttpStatus.OK)
  async triggerAll() {
    const jobs = await this.queueService.triggerSyncForAllUsers();
    return {
      message: 'Sync jobs added for all users',
      count: jobs.length,
      jobs: jobs.map(job => ({
        userId: job.userId,
        jobId: job.jobId,
        delay: job.delay,
      })),
    };
  }
}
