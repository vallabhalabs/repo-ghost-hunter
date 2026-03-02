import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GitHubService {
  private readonly apiUrl = 'https://api.github.com';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private async makeRequest(accessToken: string, endpoint: string, params?: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
          params,
        }),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data?.message || 'GitHub API error',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserRepos(accessToken: string) {
    return this.makeRequest(accessToken, '/user/repos', {
      per_page: 100,
      sort: 'updated',
    });
  }

  async getRepoCommits(accessToken: string, owner: string, repo: string) {
    return this.makeRequest(accessToken, `/repos/${owner}/${repo}/commits`, {
      per_page: 1,
    });
  }

  async getRepoPulls(accessToken: string, owner: string, repo: string, state: string = 'open') {
    return this.makeRequest(accessToken, `/repos/${owner}/${repo}/pulls`, {
      state,
      per_page: 100,
    });
  }

  async getRepoIssues(accessToken: string, owner: string, repo: string, state: string = 'open') {
    return this.makeRequest(accessToken, `/repos/${owner}/${repo}/issues`, {
      state,
      per_page: 100,
    });
  }

  async getRepoContributors(accessToken: string, owner: string, repo: string) {
    return this.makeRequest(accessToken, `/repos/${owner}/${repo}/contributors`, {
      per_page: 100,
    });
  }

  async getUser(accessToken: string) {
    return this.makeRequest(accessToken, '/user');
  }
}
