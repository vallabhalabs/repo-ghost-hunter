import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PullRequest } from '../../database/entities/pullrequest.entity';
import { GitHubService } from '../github/github.service';
import { User } from '../../database/entities/user.entity';
import { Repository as RepoEntity } from '../../database/entities/repository.entity';

@Injectable()
export class PullRequestsService {
  constructor(
    @InjectRepository(PullRequest)
    private readonly pullRequestRepository: Repository<PullRequest>,
    @InjectRepository(RepoEntity)
    private readonly repoRepository: Repository<RepoEntity>,
    private readonly githubService: GitHubService,
  ) {}

  async getRepoPullRequests(repoId: string, user: User) {
    const repo = await this.repoRepository.findOne({
      where: { id: repoId, userId: user.id },
    });

    if (!repo) {
      throw new Error('Repository not found');
    }

    return this.pullRequestRepository.find({
      where: { repoId },
      order: { createdAt: 'DESC' },
    });
  }

  async getStalePullRequests(user: User) {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    return this.pullRequestRepository
      .createQueryBuilder('pr')
      .innerJoin('pr.repo', 'repo')
      .where('repo.userId = :userId', { userId: user.id })
      .andWhere('pr.status = :status', { status: 'open' })
      .andWhere('pr.createdAt < :fourteenDaysAgo', { fourteenDaysAgo })
      .getMany();
  }

  async syncRepoPullRequests(repo: RepoEntity, user: User) {
    const githubPulls = await this.githubService.getRepoPulls(
      user.accessToken,
      repo.owner,
      repo.name,
    );

    for (const githubPull of githubPulls) {
      let pullRequest = await this.pullRequestRepository.findOne({
        where: {
          githubId: githubPull.id.toString(),
          repoId: repo.id,
        },
      });

      if (!pullRequest) {
        pullRequest = this.pullRequestRepository.create({
          githubId: githubPull.id.toString(),
          repoId: repo.id,
          userId: user.id,
          number: githubPull.number,
          title: githubPull.title,
          status: githubPull.state,
          createdAt: new Date(githubPull.created_at),
          updatedAt: new Date(githubPull.updated_at),
        });
      } else {
        pullRequest.status = githubPull.state;
        pullRequest.updatedAt = new Date(githubPull.updated_at);
      }

      await this.pullRequestRepository.save(pullRequest);
    }
  }
}
