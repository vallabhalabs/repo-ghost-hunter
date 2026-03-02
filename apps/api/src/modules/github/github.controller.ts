import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GitHubService } from './github.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('github')
@UseGuards(JwtAuthGuard)
export class GitHubController {
  constructor(private readonly githubService: GitHubService) {}

  @Get('rate-limit')
  @HttpCode(HttpStatus.OK)
  async getRateLimit() {
    return this.githubService.getRateLimitInfo();
  }

  @Get('user/repos')
  async getUserRepositories(@CurrentUser() user: any) {
    return this.githubService.getUserRepositories(user);
  }

  @Get('repos/:owner/:repo/pulls')
  async getRepositoryPullRequests(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @CurrentUser() user: any,
  ) {
    return this.githubService.getRepositoryPullRequests(owner, repo, user);
  }

  @Get('repos/:owner/:repo/issues')
  async getRepositoryIssues(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @CurrentUser() user: any,
  ) {
    return this.githubService.getRepositoryIssues(owner, repo, user);
  }

  @Get('repos/:owner/:repo/commits')
  async getRepositoryCommits(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @CurrentUser() user: any,
  ) {
    return this.githubService.getRepositoryCommits(owner, repo, user);
  }
}
