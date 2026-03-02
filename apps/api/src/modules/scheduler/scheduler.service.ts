import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReposService } from '../repos/repos.service';
import { IssuesService } from '../issues/issues.service';
import { PullRequestsService } from '../pullrequests/pullrequests.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { ReportsService } from '../reports/reports.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Repository as RepoEntity } from '../../database/entities/repository.entity';

@Injectable()
export class SchedulerService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RepoEntity)
    private readonly repoRepository: Repository<RepoEntity>,
    private readonly reposService: ReposService,
    private readonly issuesService: IssuesService,
    private readonly pullRequestsService: PullRequestsService,
    private readonly analyticsService: AnalyticsService,
    private readonly reportsService: ReportsService,
  ) {}

  // Run daily at 2 AM
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async scanRepositories() {
    console.log('Starting daily repository scan...');
    
    const users = await this.userRepository.find();
    
    for (const user of users) {
      try {
        // Sync repositories
        await this.reposService.syncRepos(user);
        
        // Get user repositories
        const repos = await this.reposService.getUserRepos(user);
        
        for (const repo of repos) {
          // Sync issues and pull requests
          await this.issuesService.syncRepoIssues(repo, user);
          await this.pullRequestsService.syncRepoPullRequests(repo, user);
          
          // Calculate health score
          await this.analyticsService.calculateHealthScore(repo.id, user);
        }
        
        console.log(`Completed scan for user ${user.email}`);
      } catch (error) {
        console.error(`Error scanning repositories for user ${user.email}:`, error);
      }
    }
    
    console.log('Daily repository scan completed');
  }

  // Run weekly on Monday at 9 AM
  @Cron('0 9 * * 1')
  async sendWeeklyReports() {
    console.log('Starting weekly report generation...');
    
    const users = await this.userRepository.find();
    
    for (const user of users) {
      try {
        await this.reportsService.sendWeeklyReport(user);
        console.log(`Sent weekly report to ${user.email}`);
      } catch (error) {
        console.error(`Error sending weekly report to ${user.email}:`, error);
      }
    }
    
    console.log('Weekly report generation completed');
  }
}
