import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue } from '../../database/entities/issue.entity';
import { GitHubService } from '../github/github.service';
import { User } from '../../database/entities/user.entity';
import { Repository as RepoEntity } from '../../database/entities/repository.entity';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,
    @InjectRepository(RepoEntity)
    private readonly repoRepository: Repository<RepoEntity>,
    private readonly githubService: GitHubService,
  ) {}

  async getRepoIssues(repoId: string, user: User) {
    const repo = await this.repoRepository.findOne({
      where: { id: repoId, userId: user.id },
    });

    if (!repo) {
      throw new Error('Repository not found');
    }

    return this.issueRepository.find({
      where: { repoId },
      order: { createdAt: 'DESC' },
    });
  }

  async getStaleIssues(user: User) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.issueRepository
      .createQueryBuilder('issue')
      .innerJoin('issue.repo', 'repo')
      .where('repo.userId = :userId', { userId: user.id })
      .andWhere('issue.status = :status', { status: 'open' })
      .andWhere('issue.updatedAt < :thirtyDaysAgo', { thirtyDaysAgo })
      .getMany();
  }

  async syncRepoIssues(repo: RepoEntity, user: User) {
    const githubIssues = await this.githubService.getRepoIssues(
      user.accessToken,
      repo.owner,
      repo.name,
    );

    for (const githubIssue of githubIssues) {
      if (githubIssue.pull_request) continue; // Skip PRs

      let issue = await this.issueRepository.findOne({
        where: {
          githubId: githubIssue.id.toString(),
          repoId: repo.id,
        },
      });

      if (!issue) {
        issue = this.issueRepository.create({
          githubId: githubIssue.id.toString(),
          repoId: repo.id,
          userId: user.id,
          number: githubIssue.number,
          title: githubIssue.title,
          status: githubIssue.state,
          createdAt: new Date(githubIssue.created_at),
          updatedAt: new Date(githubIssue.updated_at),
        });
      } else {
        issue.status = githubIssue.state;
        issue.updatedAt = new Date(githubIssue.updated_at);
      }

      await this.issueRepository.save(issue);
    }
  }
}
