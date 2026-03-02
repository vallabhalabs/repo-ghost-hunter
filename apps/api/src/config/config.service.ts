import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import {
  AppConfig,
  DatabaseConfig,
  GitHubConfig,
  JwtConfig,
  RedisConfig,
} from './config.interface';

@Injectable()
export class AppConfigService {
  constructor(private configService: NestConfigService) {}

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get port(): number {
    return this.configService.get<number>('PORT', 3001);
  }

  get frontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  }

  get database(): DatabaseConfig {
    return {
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', ''),
      database: this.configService.get<string>('DB_NAME', 'repo_ghost_hunter'),
    };
  }

  get github(): GitHubConfig {
    return {
      clientId: this.configService.get<string>('GITHUB_CLIENT_ID', ''),
      clientSecret: this.configService.get<string>('GITHUB_CLIENT_SECRET', ''),
      callbackUrl: this.configService.get<string>(
        'GITHUB_CALLBACK_URL',
        'http://localhost:3001/api/auth/github/callback',
      ),
    };
  }

  get jwt(): JwtConfig {
    return {
      secret: this.configService.get<string>('JWT_SECRET', ''),
      expiresIn: '7d',
    };
  }

  get redis(): RedisConfig {
    return {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      url: this.configService.get<string>('REDIS_URL'),
    };
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }
}
