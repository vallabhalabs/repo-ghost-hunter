import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from '../config/config.service';
import { User } from './entities/user.entity';
import { Repository } from './entities/repository.entity';
import { PullRequest } from './entities/pullrequest.entity';
import { Issue } from './entities/issue.entity';
import { ActivityLog } from './entities/activitylog.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: AppConfigService) => {
        const dbConfig = configService.database;
        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          entities: [User, Repository, PullRequest, Issue, ActivityLog],
          synchronize: configService.isDevelopment,
          logging: configService.isDevelopment,
        };
      },
      inject: [AppConfigService],
    }),
  ],
})
export class DatabaseModule {}
