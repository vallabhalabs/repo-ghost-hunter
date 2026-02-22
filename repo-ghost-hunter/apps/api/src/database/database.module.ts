import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from '../config/config.service';
import { User } from './entities/user.entity';
import { Repository } from './entities/repository.entity';
import { PullRequest } from './entities/pullrequest.entity';
import { Issue } from './entities/issue.entity';
import { ActivityLog } from './entities/activitylog.entity';
import { DatabaseService } from './database.service';

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
          migrations: ['dist/database/migrations/*.js'],
          migrationsRun: false,
          migrationsTableName: 'migrations',
          // Connection pool settings
          extra: {
            max: 10, // Maximum number of connections in the pool
            min: 2, // Minimum number of connections in the pool
            idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
            connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
          },
          // SSL configuration for production
          ssl: configService.isProduction
            ? {
                rejectUnauthorized: false,
              }
            : false,
        };
      },
      inject: [AppConfigService],
    }),
  ],
  providers: [DatabaseService],
  exports: [TypeOrmModule, DatabaseService],
})
export class DatabaseModule {}
