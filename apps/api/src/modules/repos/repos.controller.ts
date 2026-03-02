import { Controller, Get, Post, UseGuards, Req, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ReposService } from './repos.service';

@Controller('repos')
@UseGuards(AuthGuard('jwt'))
export class ReposController {
  constructor(private readonly reposService: ReposService) {}

  @Get()
  async getUserRepos(@Req() req: Request) {
    return this.reposService.getUserRepos(req.user);
  }

  @Post('sync')
  async syncRepos(@Req() req: Request) {
    return this.reposService.syncRepos(req.user);
  }

  @Get(':id')
  async getRepo(@Param('id') id: string, @Req() req: Request) {
    return this.reposService.getRepo(id, req.user);
  }
}
