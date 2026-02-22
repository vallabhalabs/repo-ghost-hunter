import { Injectable } from '@nestjs/common';
import { ReposService } from '../repos/repos.service';
import { IssuesService } from '../issues/issues.service';
import { PullRequestsService } from '../pullrequests/pullrequests.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    private readonly reposService: ReposService,
    private readonly issuesService: IssuesService,
    private readonly pullRequestsService: PullRequestsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async generateWeeklyReport(user: User) {
    const repos = await this.reposService.getUserRepos(user);
    const staleIssues = await this.issuesService.getStaleIssues(user);
    const stalePRs = await this.pullRequestsService.getStalePullRequests(user);

    const report = {
      user: {
        name: user.name,
        email: user.email,
      },
      generatedAt: new Date(),
      summary: {
        totalRepos: repos.length,
        totalStalePRs: stalePRs.length,
        totalStaleIssues: staleIssues.length,
      },
      repositories: repos.map((repo) => ({
        name: repo.name,
        healthScore: repo.healthScore,
        lastCommit: repo.lastCommit,
        openPrCount: repo.openPrCount,
        openIssueCount: repo.openIssueCount,
      })),
    };

    return report;
  }

  async sendWeeklyReport(user: User) {
    const report = await this.generateWeeklyReport(user);
    
    // TODO: Implement email sending logic
    // For now, just return the report
    console.log('Weekly report generated:', report);
    
    return {
      message: 'Weekly report generated successfully',
      report,
    };
  }
}
