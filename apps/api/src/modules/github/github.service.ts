import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { 
  GitHubRepositoryResponse, 
  GitHubPullRequestsResponse, 
  GitHubIssuesResponse, 
  GitHubCommitsResponse,
  GitHubRateLimitResponse 
} from './interfaces/github-api.interface';
import { 
  GitHubRepository, 
  GitHubPullRequest, 
  GitHubIssue, 
  GitHubCommit 
} from './dto/github-api.dto';
import {
  GithubUnauthorizedException,
  GithubRateLimitException,
  GithubForbiddenException,
  GithubNotFoundException,
  GithubApiException,
} from './exceptions/github.exceptions';
import { User } from '@repo/database';
import { EncryptionUtil } from '../../common/utils/encryption.util';

@Injectable()
export class GitHubService implements OnModuleInit {
  private readonly logger = new Logger(GitHubService.name);
  private readonly baseUrl = 'https://api.github.com';
  private rateLimitInfo: { limit: number; remaining: number; reset: string; resetTime: number } = {
    limit: 5000,
    remaining: 5000,
    reset: new Date().toISOString(),
    resetTime: Date.now(),
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.logger.log('GitHub Service initialized');
  }

  private getAuthHeaders(user: User): { Authorization: string } {
    if (!user.accessToken) {
      throw new GithubUnauthorizedException('No access token available for user');
    }
    const decryptedToken = EncryptionUtil.decrypt(user.accessToken);
    return { Authorization: `token ${decryptedToken}` };
  }

  private handleRateLimit(headers: Record<string, string>): void {
    const rateLimitRemaining = headers['x-ratelimit-remaining'];
    const rateLimitReset = headers['x-ratelimit-reset'];
    const rateLimit = headers['x-ratelimit-limit'];

    if (rateLimitRemaining) {
      this.rateLimitInfo = {
        limit: parseInt(rateLimit, 10),
        remaining: parseInt(rateLimitRemaining, 10),
        reset: rateLimitReset || new Date(Date.now() + 3600000).toISOString(), // Default 1 hour if not provided
        resetTime: rateLimitReset ? new Date(rateLimitReset).getTime() : Date.now() + 3600000,
      };
    }

    if (this.rateLimitInfo.remaining <= 100) {
      this.logger.warn(`GitHub API rate limit running low: ${this.rateLimitInfo.remaining} requests remaining`);
    }
  }

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    options: {
      user?: User;
      params?: Record<string, any>;
      data?: any;
    } = {},
  ): Promise<T> {
    try {
      const headers = options.user ? this.getAuthHeaders(options.user) : {};
      
      const config = {
        method,
        url: `${this.baseUrl}${url}`,
        headers,
        timeout: 10000,
        maxRedirects: 5,
        ...options,
      };

      const response = await this.httpService.request(config);
      
      // Handle rate limiting
      this.handleRateLimit(response.headers);
      
      return response.data;
    } catch (error) {
      this.logger.error(`GitHub API error: ${error.message}`, error.stack);
      
      if (error.response?.status === 401) {
        throw new GithubUnauthorizedException();
      } else if (error.response?.status === 403) {
        throw new GithubForbiddenException();
      } else if (error.response?.status === 404) {
        throw new GithubNotFoundException();
      } else if (error.response?.status === 429) {
        throw new GithubRateLimitException();
      } else {
        throw new GithubApiException(error.message);
      }
    }
  }

  async getUserRepositories(user: User): Promise<GitHubRepository[]> {
    this.logger.log(`Fetching repositories for user: ${user.id}`);
    
    const response = await this.makeRequest<GitHubRepositoryResponse>('GET', '/user/repos', {
      user,
      params: {
        type: 'owner',
        sort: 'updated',
        per_page: 100,
      },
    });

    return response.data;
  }

  async getRepositoryPullRequests(owner: string, repo: string, user: User): Promise<GitHubPullRequest[]> {
    this.logger.log(`Fetching pull requests for ${owner}/${repo}`);
    
    const response = await this.makeRequest<GitHubPullRequestsResponse>('GET', `/repos/${owner}/${repo}/pulls`, {
      user,
      params: {
        state: 'open',
        sort: 'updated',
        per_page: 100,
      },
    });

    return response.data;
  }

  async getRepositoryIssues(owner: string, repo: string, user: User): Promise<GitHubIssue[]> {
    this.logger.log(`Fetching issues for ${owner}/${repo}`);
    
    const response = await this.makeRequest<GitHubIssuesResponse>('GET', `/repos/${owner}/${repo}/issues`, {
      user,
      params: {
        state: 'open',
        sort: 'updated',
        per_page: 100,
      },
    });

    return response.data;
  }

  async getRepositoryCommits(owner: string, repo: string, user: User): Promise<GitHubCommit[]> {
    this.logger.log(`Fetching commits for ${owner}/${repo}`);
    
    const response = await this.makeRequest<GitHubCommitsResponse>('GET', `/repos/${owner}/${repo}/commits`, {
      user,
      params: {
        per_page: 100,
      },
    });

    return response.data;
  }

  getRateLimitInfo(): { limit: number; remaining: number; reset: string; resetTime: number } {
    return this.rateLimitInfo;
  }
}
