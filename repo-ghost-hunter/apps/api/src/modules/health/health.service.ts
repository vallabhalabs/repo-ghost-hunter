import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/config.service';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly configService: AppConfigService,
    private readonly databaseService: DatabaseService,
  ) {}

  async getHealthStatus() {
    const dbInfo = await this.databaseService.getConnectionInfo();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.nodeEnv,
      version: process.env.npm_package_version || '1.0.0',
      service: 'repo-ghost-hunter-api',
      database: {
        connected: dbInfo.isConnected,
        database: dbInfo.database,
        host: dbInfo.host,
        port: dbInfo.port,
      },
    };
  }
}
