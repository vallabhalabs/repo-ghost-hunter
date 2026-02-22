import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IssuesService } from './issues.service';

@Controller('issues')
@UseGuards(AuthGuard('jwt'))
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Get('repo/:repoId')
  async getRepoIssues(@Param('repoId') repoId: string, @Req() req: Request) {
    return this.issuesService.getRepoIssues(repoId, req.user);
  }

  @Get('stale')
  async getStaleIssues(@Req() req: Request) {
    return this.issuesService.getStaleIssues(req.user);
  }
}
