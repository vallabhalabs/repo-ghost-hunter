import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@repo/database';
import { 
  AnalyticsOverview, 
  RepositoryAnalytics, 
  ActivityTrend,
  AnalyticsQuery,
  Pagination,
  PaginatedRepositoriesResponse 
} from './dto/analytics.dto';
import { Repository } from '@repo/database';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string): Promise<AnalyticsOverview> {
    this.logger.log(`Generating analytics overview for user: ${userId}`);

    const [
      totalRepos,
      healthyRepos,
      atRiskRepos,
      criticalRepos,
      avgHealthScore,
      lastSyncedAt,
    ] = await Promise.all([
      this.prisma.repository.count({
        where: { userId },
      }),
      this.prisma.repository.count({
        where: { 
          userId,
          healthScore: { gt: 75 },
        },
      }),
      this.prisma.repository.count({
        where: { 
          userId,
          healthScore: { gte: 40, lte: 75 },
        },
      }),
      this.prisma.repository.count({
        where: { 
          userId,
          healthScore: { lt: 40 },
        },
      }),
      this.prisma.repository.aggregate({
        where: { userId },
        _avg: {
          healthScore: true,
        },
        _max: {
          updatedAt: true,
        },
      }),
    ]);

    return {
      total_repositories: totalRepos,
      healthy_repositories: healthyRepos,
      at_risk_repositories: atRiskRepos,
      critical_repositories: criticalRepos,
      average_health_score: avgHealthScore._avg.healthScore || 0,
      last_synced_at: avgHealthScore._max.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  async getRepositories(
    userId: string,
    query: AnalyticsQuery,
  ): Promise<PaginatedRepositoriesResponse> {
    this.logger.log(`Fetching repositories for user: ${userId} with query:`, query);

    const whereClause: any = { userId };
    
    if (query.status) {
      switch (query.status) {
        case 'healthy':
          whereClause.healthScore = { gt: 75 };
          break;
        case 'at_risk':
          whereClause.healthScore = { gte: 40, lte: 75 };
          break;
        case 'critical':
          whereClause.healthScore = { lt: 40 };
          break;
      }
    }

    const skip = (query.page - 1) * query.limit;

    const [repositories, totalCount] = await Promise.all([
      this.prisma.repository.findMany({
        where: whereClause,
        select: {
          id: true,
          github_repo_id: true,
          name: true,
          full_name: true,
          private: true,
          default_branch: true,
          last_commit_at: true,
          open_pr_count: true,
          open_issue_count: true,
          health_score: true,
          updated_at: true,
          created_at: true,
          user_id: true,
        },
        orderBy: {
          health_score: 'asc',
        },
        skip,
        take: query.limit,
      }),
      this.prisma.repository.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / query.limit);

    return {
      data: repositories,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: totalCount,
        totalPages,
      },
    };
  }

  async getActivityTrend(userId: string): Promise<ActivityTrend> {
    this.logger.log(`Generating activity trend for user: ${userId}`);

    const repositories = await this.prisma.repository.findMany({
      where: { userId },
      select: {
        last_commit_at: true,
      },
    });

    const now = new Date();
    const buckets = [
      { range: '0-7 days', min: 0, max: 7 },
      { range: '8-30 days', min: 8, max: 30 },
      { range: '31-90 days', min: 31, max: 90 },
      { range: '90+ days', min: 91, max: 999999 },
    ];

    const trendBuckets = buckets.map(bucket => {
      const count = repositories.filter(repo => {
        if (!repo.last_commit_at) return false;
        
        const daysSinceLastCommit = Math.floor(
          (now.getTime() - new Date(repo.last_commit_at).getTime()) / (1000 * 60 * 60 * 24),
        );
        
        return daysSinceLastCommit >= bucket.min && daysSinceLastCommit <= bucket.max;
      }).length;

      return {
        range: bucket.range,
        count,
      };
    });

    return {
      buckets: trendBuckets,
    };
  }

  private getHealthStatus(score: number): 'healthy' | 'at_risk' | 'critical' {
    if (score > 75) return 'healthy';
    if (score >= 40) return 'at_risk';
    return 'critical';
  }
}
