import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repository as RepoEntity } from '../../database/entities/repository.entity';
import { GitHubService } from '../github/github.service';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class ReposService {
  constructor(
    @InjectRepository(RepoEntity)
    private readonly repoRepository: Repository<RepoEntity>,
    private readonly githubService: GitHubService,
  ) {}

  async getUserRepos(user: User) {
    return this.repoRepository.find({
      where: { userId: user.id },
      order: { updatedAt: 'DESC' },
    });
  }

  async syncRepos(user: User) {
    const githubRepos = await this.githubService.getUserRepos(user.accessToken);
    
    const repos = await Promise.all(
      githubRepos.map(async (githubRepo: any) => {
        let repo = await this.repoRepository.findOne({
          where: {
            githubId: githubRepo.id.toString(),
            userId: user.id,
          },
        });

        if (!repo) {
          repo = this.repoRepository.create({
            githubId: githubRepo.id.toString(),
            userId: user.id,
            name: githubRepo.name,
            owner: githubRepo.owner.login,
            fullName: githubRepo.full_name,
            description: githubRepo.description,
            url: githubRepo.html_url,
            private: githubRepo.private,
          });
        } else {
          repo.name = githubRepo.name;
          repo.description = githubRepo.description;
          repo.url = githubRepo.html_url;
        }

        return this.repoRepository.save(repo);
      }),
    );

    return repos;
  }

  async getRepo(id: string, user: User) {
    return this.repoRepository.findOne({
      where: { id, userId: user.id },
    });
  }
}
