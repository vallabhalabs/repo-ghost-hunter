import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../../database/entities/activitylog.entity';
import { Repository as RepoEntity } from '../../database/entities/repository.entity';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
    @InjectRepository(RepoEntity)
    private readonly repoRepository: Repository<RepoEntity>,
  ) {}

  async calculateHealthScore(repoId: string, user: User) {
    const repo = await this.repoRepository.findOne({
      where: { id: repoId, userId: user.id },
    });

    if (!repo) {
      throw new Error('Repository not found');
    }

    // Calculate health score based on various factors
    // This is a simplified version - you can expand this logic
    let score = 100;

    // Deduct points for stale items
    if (repo.openPrCount > 0) score -= repo.openPrCount * 2;
    if (repo.openIssueCount > 0) score -= repo.openIssueCount * 1;

    // Deduct points for inactivity
    if (repo.lastCommit) {
      const daysSinceLastCommit = Math.floor(
        (Date.now() - new Date(repo.lastCommit).getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceLastCommit > 30) {
        score -= 20;
      } else if (daysSinceLastCommit > 14) {
        score -= 10;
      }
    }

    score = Math.max(0, Math.min(100, score));

    // Update repository health score
    repo.healthScore = score;
    await this.repoRepository.save(repo);

    return { score, repoId };
  }

  async getActivityLogs(repoId: string, user: User) {
    const repo = await this.repoRepository.findOne({
      where: { id: repoId, userId: user.id },
    });

    if (!repo) {
      throw new Error('Repository not found');
    }

    return this.activityLogRepository.find({
      where: { repoId },
      order: { week: 'DESC' },
      take: 12, // Last 12 weeks
    });
  }
}
