import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@repo/database';
import { 
  GitHubRepositoryResponse, 
  GitHubPullRequestsResponse, 
  GitHubIssuesResponse, 
  GitHubCommitsResponse 
} from '../github/interfaces/github-api.interface';
import { 
  GithubUnauthorizedException,
  GithubRateLimitException,
  GithubForbiddenException,
  GithubNotFoundException,
  GithubApiException,
} from '../github/exceptions/github.exceptions';
import { EncryptionUtil } from '../../common/utils/encryption.util';

interface RepositoryMetrics {
  recentCommitWeight: number;
  recencyScore: number;
  prActivityScore: number;
  issueActivityScore: number;
}

interface SyncSummary {
  synced_count: number;
  repositories: Array<{
    id: string;
    github_repo_id: number;
    name: string;
    full_name: string;
    private: boolean;
    default_branch: string;
    last_commit_at: Date;
    open_pr_count: number;
    open_issue_count: number;
    updated_at: Date;
    health_score: number;
  }>;
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private readonly metrics: RepositoryMetrics = {
    recentCommitWeight: 0.4,
    recencyScore: 0.3,
    prActivityScore: 0.2,
    issueActivityScore: 0.1,
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async syncRepository(
    userId: string, 
    githubRepo: any, 
    organizationId?: string
  ): Promise<boolean> {
    try {
      // Fetch additional data for the repository
      const [pullRequests, issues, commits] = await Promise.all([
        this.httpService.get<GitHubPullRequestsResponse>(
          `https://api.github.com/repos/${githubRepo.owner.login}/${githubRepo.name}/pulls`,
          {
            headers: {
              Authorization: `token ${this.configService.get<string>('GITHUB_TOKEN')}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        ),
        this.httpService.get<GitHubIssuesResponse>(
          `https://api.github.com/repos/${githubRepo.owner.login}/${githubRepo.name}/issues`,
          {
            headers: {
              Authorization: `token ${this.configService.get<string>('GITHUB_TOKEN')}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        ),
        this.httpService.get<GitHubCommitsResponse>(
          `https://api.github.com/repos/${githubRepo.owner.login}/${githubRepo.name}/commits`,
          {
            headers: {
              Authorization: `token ${this.configService.get<string>('GITHUB_TOKEN')}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        ),
      ]);

      // Calculate health score
      const healthScore = this.calculateHealthScore(githubRepo, pullRequests.data, issues.data);
      
      // Upsert repository
      await this.prisma.repository.upsert({
        where: { githubRepoId: githubRepo.id },
        update: {
          name: githubRepo.name,
          fullName: githubRepo.full_name,
          private: githubRepo.private || false,
          defaultBranch: githubRepo.default_branch || 'main',
          lastCommitAt: githubRepo.updated_at ? new Date(githubRepo.updated_at) : new Date(0),
          openPrCount: pullRequests?.data?.length || 0,
          openIssueCount: issues?.data?.length || 0,
          healthScore,
          updatedAt: new Date(),
          organizationId,
        },
        create: {
          userId,
          githubRepoId: githubRepo.id,
          name: githubRepo.name,
          fullName: githubRepo.full_name,
          private: githubRepo.private || false,
          defaultBranch: githubRepo.default_branch || 'main',
          lastCommitAt: githubRepo.updated_at ? new Date(githubRepo.updated_at) : new Date(0),
          openPrCount: pullRequests?.data?.length || 0,
          openIssueCount: issues?.data?.length || 0,
          healthScore,
          organizationId,
        },
      });

      return true;
    } catch (error) {
      this.logger.error(`Error syncing repository ${githubRepo.name}: ${error.message}`);
      return false;
    }
  }

  private calculateHealthScore(repository: any, pullRequests: any[], issues: any[]): number {
    const now = new Date();
    const lastCommitDate = repository.last_commit_at ? new Date(repository.last_commit_at) : new Date(0);
    const daysSinceLastCommit = Math.max(0, Math.floor((now.getTime() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Recency score (0-1, more recent is better)
    const recencyScore = Math.max(0, 1 - (daysSinceLastCommit / 90));
    
    // PR activity score (0-1, more active is better)
    const prActivityScore = Math.min(1, (pullRequests?.length || 0) / 10);
    
    // Issue activity score (0-1, more active is better)
    const issueActivityScore = Math.min(1, (issues?.length || 0) / 20);
    
    const healthScore = 
      (this.metrics.recentCommitWeight * recencyScore) +
      (this.metrics.prActivityScore * prActivityScore) +
      (this.metrics.issueActivityScore * issueActivityScore);
    
    return healthScore;
  }

  private calculateHealthScore(repository: any, pullRequests: any[], issues: any[]): number {
    const now = new Date();
    const lastCommitDate = repository.last_commit_at ? new Date(repository.last_commit_at) : new Date(0);
    const daysSinceLastCommit = Math.max(0, Math.floor((now.getTime() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Recency score (0-1, more recent is better)
    const recencyScore = Math.max(0, 1 - (daysSinceLastCommit / 90));
    
    // PR activity score (0-1, more active is better)
    const prActivityScore = Math.min(1, (pullRequests?.length || 0) / 10);
    
    // Issue activity score (0-1, more active is better)
    const issueActivityScore = Math.min(1, (issues?.length || 0) / 20);
    
    const healthScore = 
      (this.metrics.recentCommitWeight * recencyScore) +
      (this.metrics.prActivityScore * prActivityScore) +
      (this.metrics.issueActivityScore * issueActivityScore);
    
    this.logger.log(`Health score calculated for ${repository.name}: ${healthScore.toFixed(2)}`);
    return healthScore;
  }

  private async decryptUserToken(user: any): Promise<string> {
    if (!user.accessToken) {
      throw new GithubUnauthorizedException('No access token available for user');
    }
    return EncryptionUtil.decrypt(user.accessToken);
  }

  private async fetchWithRetry<T>(
    url: string,
    options: any,
    retries: number = 3,
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.httpService.get(url, options);
        return response.data;
      } catch (error) {
        lastError = error;
        this.logger.warn(`Attempt ${attempt} failed for ${url}: ${error.message}`);
        
        if (attempt === retries) {
          throw error;
        }
      }
    }
    
    if (lastError) {
      throw lastError;
    }
  }

  async syncUserRepositories(userId: string): Promise<SyncSummary> {
    this.logger.log(`Starting repository sync for user: ${userId}`);
    const startTime = Date.now();
    
    try {
      // Get user with decrypted token
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          accessToken: true,
        },
      });

      if (!user) {
        throw new GithubUnauthorizedException('User not found');
      }

      const decryptedToken = await this.decryptUserToken(user);
      
      // Fetch user's repositories from GitHub
      const githubRepos = await this.fetchWithRetry<GitHubRepositoryResponse>(
        'https://api.github.com/user/repos',
        {
          headers: {
            Authorization: `token ${decryptedToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
          user,
        }
      );

      // Get existing repositories from database
      const existingRepos = await this.prisma.repository.findMany({
        where: { userId },
        select: {
          id: true,
          githubRepoId: true,
          name: true,
          fullName: true,
          private: true,
          defaultBranch: true,
          lastCommitAt: true,
          openPrCount: true,
          openIssueCount: true,
          healthScore: true,
          updatedAt: true,
        },
      });

      const syncedRepos: any[] = [];
      let updatedCount = 0;
      let createdCount = 0;

      // Process each repository
      for (const githubRepo of githubRepos.data) {
        try {
          // Fetch additional data for each repository
          const [pullRequests, issues, commits] = await Promise.all([
            this.fetchWithRetry<GitHubPullRequestsResponse>(
              `https://api.github.com/repos/${githubRepo.owner.login}/${githubRepo.name}/pulls`,
              { user }
            ),
            this.fetchWithRetry<GitHubIssuesResponse>(
              `https://api.github.com/repos/${githubRepo.owner.login}/${githubRepo.name}/issues`,
              { user }
            ),
            this.fetchWithRetry<GitHubCommitsResponse>(
              `https://api.github.com/repos/${githubRepo.owner.login}/${githubRepo.name}/commits`,
              { user }
            ),
          ]);

          // Calculate health score
          const healthScore = this.calculateHealthScore(githubRepo, pullRequests, issues);
          
          // Find existing repository
          const existingRepo = existingRepos.find(r => r.githubRepoId === githubRepo.id);
          
          const repoData = {
            name: githubRepo.name,
            fullName: githubRepo.full_name,
            private: githubRepo.private || false,
            defaultBranch: githubRepo.default_branch || 'main',
            lastCommitAt: githubRepo.updated_at ? new Date(githubRepo.updated_at) : new Date(0),
            openPrCount: pullRequests?.length || 0,
            openIssueCount: issues?.length || 0,
            healthScore,
            updatedAt: new Date(),
          };

          if (existingRepo) {
            // Update existing repository
            await this.prisma.repository.update({
              where: { id: existingRepo.id },
              data: {
                ...repoData,
                updatedAt: new Date(),
              },
            });
            updatedCount++;
          } else {
            // Create new repository
            await this.prisma.repository.create({
              data: {
                userId,
                githubRepoId: githubRepo.id,
                ...repoData,
              },
            });
            createdCount++;
          }

          syncedRepos.push(repoData);
        } catch (error) {
          this.logger.error(`Error processing repository ${githubRepo.name}: ${error.message}`);
        }
      }

      const duration = Date.now() - startTime.getTime();
      this.logger.log(`Repository sync completed for user ${userId} in ${duration}ms`);
      
      return {
        synced_count: syncedRepos.length,
        repositories: syncedRepos,
        updated_count: updatedCount,
        created_count: createdCount,
      };
    } catch (error) {
      this.logger.error(`Repository sync failed for user ${userId}: ${error.message}`, error.stack);
      throw new GithubApiException(`Repository sync failed: ${error.message}`);
    }
  }
}
