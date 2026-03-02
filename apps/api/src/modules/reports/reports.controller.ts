import { Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('weekly')
  async getWeeklyReport(@Req() req: Request) {
    return this.reportsService.generateWeeklyReport(req.user);
  }

  @Post('send-weekly')
  async sendWeeklyReport(@Req() req: Request) {
    return this.reportsService.sendWeeklyReport(req.user);
  }
}
