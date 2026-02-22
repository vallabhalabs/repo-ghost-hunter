import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { PullRequestsService } from './pullrequests.service';

@Controller('pull-requests')
@UseGuards(AuthGuard('jwt'))
export class PullRequestsController {
  constructor(private readonly pullRequestsService: PullRequestsService) {}

  @Get('repo/:repoId')
  async getRepoPullRequests(@Param('repoId') repoId: string, @Req() req: Request) {
    return this.pullRequestsService.getRepoPullRequests(repoId, req.user);
  }

  @Get('stale')
  async getStalePullRequests(@Req() req: Request) {
    return this.pullRequestsService.getStalePullRequests(req.user);
  }
}
