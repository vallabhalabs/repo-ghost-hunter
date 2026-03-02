import { Processor, Process } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { NotificationService, WeeklyReportJobData } from './notification.service';
import { NotificationTemplates } from './notification.templates';

@Processor('repo-sync')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly notificationService: NotificationService) {
    this.setupTransporter();
  }

  private setupTransporter() {
    const smtpConfig = this.notificationService.getSmtpConfig();
    
    if (!this.notificationService.isSmtpConfigured()) {
      this.logger.warn('SMTP not configured, email notifications will be skipped');
      return;
    }

    this.transporter = nodemailer.createTransporter({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: smtpConfig.auth,
    });
  }

  @Process('weekly-report')
  async handleWeeklyReportJob(job: Job<WeeklyReportJobData>) {
    const startTime = Date.now();
    const { userId, userEmail, userName } = job.data;

    this.logger.log(`Processing weekly report job ${job.id} for user: ${userId}`);

    if (!this.notificationService.isSmtpConfigured()) {
      this.logger.error('SMTP not configured, skipping weekly report');
      throw new Error('SMTP not configured');
    }

    try {
      // Update job progress
      await job.updateProgress(10);

      // Generate report data
      const reportData = await this.notificationService.generateWeeklyReportData(userId);
      
      await job.updateProgress(50);

      // Generate email content
      const htmlContent = NotificationTemplates.generateWeeklyReportHTML(userName, reportData);
      const textContent = NotificationTemplates.generateWeeklyReportText(userName, reportData);
      
      await job.updateProgress(80);

      // Send email
      const mailOptions = {
        from: this.notificationService.getSmtpConfig().from,
        to: userEmail,
        subject: `⚠ Repo Health Report — ${reportData.criticalCount + reportData.atRiskCount} Repositories At Risk`,
        html: htmlContent,
        text: textContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      await job.updateProgress(100);

      const duration = Date.now() - startTime;
      this.logger.log(
        `Weekly report email sent successfully to ${userEmail} (Message ID: ${result.messageId}) in ${duration}ms. ` +
        `Report: ${reportData.totalRepos} repos, ${reportData.criticalCount + reportData.atRiskCount} at risk`
      );

      return {
        success: true,
        userId,
        userEmail,
        messageId: result.messageId,
        reportData,
        duration,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error(
        `Weekly report job ${job.id} failed for user ${userId} after ${duration}ms`,
        error.stack
      );

      // Don't retry on SMTP configuration errors
      if (error.message.includes('SMTP not configured')) {
        throw error;
      }

      // Retry on other errors
      throw new Error(`Failed to send weekly report: ${error.message}`);
    }
  }
}
