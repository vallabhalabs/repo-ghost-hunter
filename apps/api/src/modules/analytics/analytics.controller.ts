import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('repo/:repoId/health-score')
  async getHealthScore(@Param('repoId') repoId: string, @Req() req: Request) {
    return this.analyticsService.calculateHealthScore(repoId, req.user);
  }

  @Get('repo/:repoId/activity')
  async getActivity(@Param('repoId') repoId: string, @Req() req: Request) {
    return this.analyticsService.getActivityLogs(repoId, req.user);
  }
}
