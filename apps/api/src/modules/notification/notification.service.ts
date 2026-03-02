import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '@repo/database';

export interface WeeklyReportJobData {
  userId: string;
  userEmail: string;
  userName: string;
}

export interface RepositoryReport {
  name: string;
  fullName: string;
  lastCommitAt: Date;
  openPrCount: number;
  openIssueCount: number;
  healthScore: number;
  status: 'healthy' | 'at_risk' | 'critical';
}

export interface WeeklyReportData {
  totalRepos: number;
  averageHealthScore: number;
  healthyCount: number;
  atRiskCount: number;
  criticalCount: number;
  criticalRepos: RepositoryReport[];
  atRiskRepos: RepositoryReport[];
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectQueue('repo-sync') private readonly repoSyncQueue: Queue,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async addWeeklyReportJob(userId: string, userEmail: string, userName: string) {
    this.logger.log(`Adding weekly report job for user: ${userId}`);
    
    return this.repoSyncQueue.add(
      'weekly-report',
      { userId, userEmail, userName } as WeeklyReportJobData,
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );
  }

  async generateWeeklyReportData(userId: string): Promise<WeeklyReportData> {
    this.logger.log(`Generating weekly report data for user: ${userId}`);

    const repositories = await this.prisma.repository.findMany({
      where: { userId },
      select: {
        name: true,
        fullName: true,
        last_commit_at: true,
        open_pr_count: true,
        open_issue_count: true,
        health_score: true,
      },
      orderBy: {
        health_score: 'asc',
      },
    });

    const categorizedRepos = repositories.map(repo => ({
      name: repo.name,
      fullName: repo.fullName,
      lastCommitAt: repo.last_commit_at,
      openPrCount: repo.open_pr_count,
      openIssueCount: repo.open_issue_count,
      healthScore: repo.health_score,
      status: this.getHealthStatus(repo.health_score),
    }));

    const healthyRepos = categorizedRepos.filter(repo => repo.status === 'healthy');
    const atRiskRepos = categorizedRepos.filter(repo => repo.status === 'at_risk');
    const criticalRepos = categorizedRepos.filter(repo => repo.status === 'critical');

    const averageHealthScore = repositories.length > 0
      ? repositories.reduce((sum, repo) => sum + repo.health_score, 0) / repositories.length
      : 0;

    return {
      totalRepos: repositories.length,
      averageHealthScore,
      healthyCount: healthyRepos.length,
      atRiskCount: atRiskRepos.length,
      criticalCount: criticalRepos.length,
      criticalRepos: criticalRepos.slice(0, 5), // Top 5 worst
      atRiskRepos: atRiskRepos.slice(0, 3), // Top 3 at-risk
    };
  }

  async triggerWeeklyReportsForAllUsers() {
    this.logger.log('Triggering weekly reports for all users');
    
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    const jobs = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const delay = i * 3000; // Stagger jobs by 3 seconds
      
      if (user.email) {
        const job = await this.addWeeklyReportJob(user.id, user.email, user.name || user.email);
        jobs.push({ userId: user.id, userEmail: user.email, jobId: job.id, delay });
      }
    }

    this.logger.log(`Added ${jobs.length} weekly report jobs to queue`);
    return jobs;
  }

  private getHealthStatus(score: number): 'healthy' | 'at_risk' | 'critical' {
    if (score > 75) return 'healthy';
    if (score >= 40) return 'at_risk';
    return 'critical';
  }

  getSmtpConfig() {
    return {
      host: this.configService.get<string>('SMTP_HOST'),
      port: parseInt(this.configService.get<string>('SMTP_PORT') || '587'),
      secure: this.configService.get<string>('SMTP_PORT') === '465',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      from: this.configService.get<string>('EMAIL_FROM'),
    };
  }

  isSmtpConfigured(): boolean {
    const config = this.getSmtpConfig();
    return !!(config.host && config.port && config.auth.user && config.auth.pass && config.from);
  }
}
