import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/config.service';

@Injectable()
export class HealthService {
  constructor(private readonly configService: AppConfigService) {}

  getHealthStatus() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.nodeEnv,
      version: process.env.npm_package_version || '1.0.0',
      service: 'repo-ghost-hunter-api',
    };
  }
}
