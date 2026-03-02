import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '@repo/database';
import { EncryptionUtil } from '../../common/utils/encryption.util';
import { SyncService } from '../sync/sync.service';

export interface GitHubOrganization {
  id: number;
  login: string;
  avatar_url?: string;
  description?: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  updated_at: string;
  owner: {
    login: string;
    id: number;
    avatar_url?: string;
  };
}

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly syncService: SyncService,
  ) {}

  async syncUserOrganizations(userId: string): Promise<{ synced_count: number }> {
    this.logger.log(`Syncing organizations for user: ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { accessToken: true },
    });

    if (!user || !user.accessToken) {
      throw new Error('User not found or no access token available');
    }

    const decryptedToken = EncryptionUtil.decrypt(user.accessToken);

    // Fetch organizations from GitHub
    const response = await this.httpService.get<GitHubOrganization[]>('https://api.github.com/user/orgs', {
      headers: {
        Authorization: `token ${decryptedToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const organizations = response.data;
    let syncedCount = 0;

    for (const org of organizations) {
      await this.prisma.organization.upsert({
        where: {
          githubOrgId: org.id,
        },
        update: {
          login: org.login,
          avatarUrl: org.avatar_url,
          userId,
          updatedAt: new Date(),
        },
        create: {
          githubOrgId: org.id,
          login: org.login,
          avatarUrl: org.avatar_url,
          userId,
        },
      });
      syncedCount++;
    }

    this.logger.log(`Synced ${syncedCount} organizations for user: ${userId}`);
    return { synced_count: syncedCount };
  }

  async syncOrganizationRepositories(userId: string, orgLogin: string): Promise<{ synced_count: number }> {
    this.logger.log(`Syncing repositories for organization: ${orgLogin}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { accessToken: true },
    });

    if (!user || !user.accessToken) {
      throw new Error('User not found or no access token available');
    }

    const decryptedToken = EncryptionUtil.decrypt(user.accessToken);
    const organization = await this.prisma.organization.findUnique({
      where: { login: orgLogin, userId },
    });

    if (!organization) {
      throw new Error(`Organization ${orgLogin} not found for user`);
    }

    // Fetch organization repositories from GitHub
    const response = await this.httpService.get<GitHubRepository[]>(`https://api.github.com/orgs/${orgLogin}/repos`, {
      headers: {
        Authorization: `token ${decryptedToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
      params: {
        type: 'all',
        sort: 'updated',
        per_page: 100,
      },
    });

    const repositories = response.data;
    let syncedCount = 0;

    for (const repo of repositories) {
      // Use existing sync logic to compute health and metrics
      const syncResult = await this.syncService.syncRepository(userId, repo, organization.id);
      if (syncResult) {
        syncedCount++;
      }
    }

    this.logger.log(`Synced ${syncedCount} repositories for organization: ${orgLogin}`);
    return { synced_count: syncedCount };
  }

  async getUserOrganizations(userId: string) {
    return this.prisma.organization.findMany({
      where: { userId },
      select: {
        id: true,
        login: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: { repositories: true },
        },
      },
      orderBy: { login: 'asc' },
    });
  }

  async getOrganizationById(userId: string, orgId: string) {
    return this.prisma.organization.findFirst({
      where: { id: orgId, userId },
      include: {
        repositories: {
          select: {
            id: true,
            name: true,
            fullName: true,
            healthScore: true,
            lastCommitAt: true,
            openPrCount: true,
            openIssueCount: true,
            updatedAt: true,
          },
          orderBy: { healthScore: 'asc' },
        },
      },
    });
  }

  async syncAllUserOrganizations(userId: string): Promise<{ total_synced: number; organizations: Array<{ login: string; synced_count: number }> }> {
    this.logger.log(`Starting full organization sync for user: ${userId}`);

    // First sync the organizations
    const { synced_count: orgCount } = await this.syncUserOrganizations(userId);
    
    // Get all user organizations
    const organizations = await this.getUserOrganizations(userId);
    const results = [];
    let totalSynced = 0;

    for (const org of organizations) {
      try {
        const { synced_count } = await this.syncOrganizationRepositories(userId, org.login);
        results.push({ login: org.login, synced_count });
        totalSynced += synced_count;
      } catch (error) {
        this.logger.error(`Failed to sync repositories for organization ${org.login}:`, error);
        results.push({ login: org.login, synced_count: 0 });
      }
    }

    this.logger.log(`Completed full organization sync for user ${userId}: ${totalSynced} repositories across ${orgCount} organizations`);
    
    return {
      total_synced: totalSynced,
      organizations: results,
    };
  }
}
