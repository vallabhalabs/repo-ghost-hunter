import { 
  Controller, 
  Post, 
  Get, 
  HttpCode, 
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('test')
  @HttpCode(HttpStatus.OK)
  async sendTestReport(@CurrentUser() user: any) {
    if (!user.email) {
      return {
        success: false,
        message: 'User email not found',
      };
    }

    if (!this.notificationService.isSmtpConfigured()) {
      return {
        success: false,
        message: 'SMTP not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM environment variables.',
      };
    }

    try {
      const job = await this.notificationService.addWeeklyReportJob(
        user.id,
        user.email,
        user.name || user.email
      );

      return {
        success: true,
        message: 'Test weekly report queued successfully',
        jobId: job.id,
        userEmail: user.email,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to queue test report',
        error: error.message,
      };
    }
  }

  @Get('config')
  @HttpCode(HttpStatus.OK)
  async getNotificationConfig() {
    return {
      smtpConfigured: this.notificationService.isSmtpConfigured(),
      smtpConfig: this.notificationService.getSmtpConfig(),
    };
  }

  @Post('trigger-all')
  @HttpCode(HttpStatus.OK)
  async triggerAllReports() {
    if (!this.notificationService.isSmtpConfigured()) {
      return {
        success: false,
        message: 'SMTP not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM environment variables.',
      };
    }

    try {
      const jobs = await this.notificationService.triggerWeeklyReportsForAllUsers();
      
      return {
        success: true,
        message: 'Weekly reports triggered for all users',
        count: jobs.length,
        jobs: jobs.map(job => ({
          userId: job.userId,
          userEmail: job.userEmail,
          jobId: job.jobId,
          delay: job.delay,
        })),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to trigger reports',
        error: error.message,
      };
    }
  }
}
