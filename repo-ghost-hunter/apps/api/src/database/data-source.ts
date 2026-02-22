import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { User } from './entities/user.entity';
import { Repository } from './entities/repository.entity';
import { PullRequest } from './entities/pullrequest.entity';
import { Issue } from './entities/issue.entity';
import { ActivityLog } from './entities/activitylog.entity';

// Load environment variables
config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'repo_ghost_hunter',
  entities: [User, Repository, PullRequest, Issue, ActivityLog],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false, // Never use synchronize in production
  logging: process.env.NODE_ENV === 'development',
  ssl:
    process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: false,
        }
      : false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
