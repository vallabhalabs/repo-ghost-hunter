import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GitHubService } from './github.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [GitHubService],
  exports: [GitHubService],
})
export class GitHubModule {}
