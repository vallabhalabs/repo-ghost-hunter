# Database Entities

TypeORM entities for the Repo Ghost Hunter application.

## User Entity

The `User` entity represents a GitHub user who has authenticated with the application.

### Fields

- **id** (`uuid`) - Primary key, auto-generated UUID
- **githubId** (`string`, unique) - GitHub user ID
- **email** (`string`, indexed) - User email address
- **name** (`string`, nullable) - User display name
- **avatar** (`string`, nullable, max 500 chars) - URL to user avatar image
- **accessToken** (`text`) - Encrypted GitHub OAuth access token
- **createdAt** (`timestamp`) - Record creation timestamp
- **updatedAt** (`timestamp`) - Record last update timestamp

### Relationships

- **repositories** - One-to-many relationship with Repository entities

### Indexes

- Unique index on `githubId`
- Index on `email` for faster lookups

### Usage Example

```typescript
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByGithubId(githubId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { githubId },
    });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
}
```

### Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar VARCHAR(500),
  access_token TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_github_id ON users(github_id);
CREATE INDEX idx_users_email ON users(email);
```

## Repository Entity

The `Repository` entity represents a GitHub repository that is being monitored by the application.

### Fields

- **id** (`uuid`) - Primary key, auto-generated UUID
- **name** (`string`) - Repository name
- **owner** (`string`, indexed) - Repository owner (GitHub username/organization)
- **lastCommit** (`timestamp`, nullable, indexed) - Date of the last commit
- **healthScore** (`int`, default: 0, indexed) - Repository health score (0-100)
- **openPrCount** (`int`, default: 0) - Number of open pull requests
- **openIssueCount** (`int`, default: 0) - Number of open issues

### Additional Fields

- **githubId** (`string`, indexed) - GitHub repository ID
- **userId** (`uuid`, indexed) - Foreign key to User entity
- **fullName** (`string`) - Full repository name (owner/name)
- **description** (`text`, nullable) - Repository description
- **url** (`string`, max 500 chars) - Repository URL
- **private** (`boolean`, default: false) - Whether repository is private
- **createdAt** (`timestamp`) - Record creation timestamp
- **updatedAt** (`timestamp`) - Record last update timestamp

### Relationships

- **user** - Many-to-one relationship with User entity
- **pullRequests** - One-to-many relationship with PullRequest entities
- **issues** - One-to-many relationship with Issue entities

### Indexes

- Index on `userId` for faster user repository queries
- Composite index on `owner` and `name` for repository lookups
- Index on `healthScore` for sorting and filtering
- Index on `lastCommit` for stale repository detection
- Index on `githubId` for GitHub API synchronization

### Usage Example

```typescript
import { Repository } from './entities/repository.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';

@Injectable()
export class ReposService {
  constructor(
    @InjectRepository(Repository)
    private readonly repoRepository: TypeOrmRepository<Repository>,
  ) {}

  async findByOwnerAndName(owner: string, name: string): Promise<Repository | null> {
    return this.repoRepository.findOne({
      where: { owner, name },
    });
  }

  async updateHealthScore(repoId: string, score: number): Promise<void> {
    await this.repoRepository.update(repoId, { healthScore: score });
  }

  async getStaleRepositories(days: number = 30): Promise<Repository[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    return this.repoRepository.find({
      where: {
        lastCommit: LessThan(date),
      },
    });
  }
}
```

### Database Schema

```sql
CREATE TABLE repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  owner VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(500) NOT NULL,
  private BOOLEAN DEFAULT FALSE,
  last_commit TIMESTAMP,
  health_score INTEGER DEFAULT 0,
  open_pr_count INTEGER DEFAULT 0,
  open_issue_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_repositories_user_id ON repositories(user_id);
CREATE INDEX idx_repositories_owner_name ON repositories(owner, name);
CREATE INDEX idx_repositories_health_score ON repositories(health_score);
CREATE INDEX idx_repositories_last_commit ON repositories(last_commit);
CREATE INDEX idx_repositories_github_id ON repositories(github_id);
```

## PullRequest Entity

The `PullRequest` entity represents a GitHub pull request that is being tracked for a repository.

### Fields

- **id** (`uuid`) - Primary key, auto-generated UUID
- **repoId** (`uuid`, indexed) - Foreign key to Repository entity
- **number** (`int`, indexed) - Pull request number from GitHub
- **createdAt** (`timestamp`, indexed) - When the pull request was created
- **status** (`string`, default: 'open', indexed) - Pull request status: 'open', 'closed', or 'merged'

### Additional Fields

- **githubId** (`string`, indexed) - GitHub pull request ID
- **userId** (`uuid`) - Foreign key to User entity
- **title** (`string`, nullable) - Pull request title
- **updatedAt** (`timestamp`) - Record last update timestamp

### Relationships

- **repo** - Many-to-one relationship with Repository entity
- **user** - Many-to-one relationship with User entity

### Indexes

- Index on `repoId` for faster repository PR queries
- Composite index on `repoId` and `status` for filtering by repository and status
- Index on `createdAt` for stale PR detection (14+ days)
- Index on `status` for status-based queries
- Index on `number` for PR number lookups
- Index on `githubId` for GitHub API synchronization

### Usage Example

```typescript
import { PullRequest } from './entities/pullrequest.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository, LessThan } from 'typeorm';

@Injectable()
export class PullRequestsService {
  constructor(
    @InjectRepository(PullRequest)
    private readonly prRepository: TypeOrmRepository<PullRequest>,
  ) {}

  async findByRepoId(repoId: string): Promise<PullRequest[]> {
    return this.prRepository.find({
      where: { repoId },
      order: { createdAt: 'DESC' },
    });
  }

  async getStalePullRequests(days: number = 14): Promise<PullRequest[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    return this.prRepository.find({
      where: {
        status: 'open',
        createdAt: LessThan(date),
      },
    });
  }

  async updateStatus(prId: string, status: string): Promise<void> {
    await this.prRepository.update(prId, { status });
  }
}
```

### Database Schema

```sql
CREATE TABLE pull_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id VARCHAR(255) NOT NULL,
  repo_id UUID NOT NULL REFERENCES repositories(id),
  user_id UUID NOT NULL REFERENCES users(id),
  number INTEGER NOT NULL,
  title VARCHAR(255),
  status VARCHAR(50) DEFAULT 'open' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pull_requests_repo_id ON pull_requests(repo_id);
CREATE INDEX idx_pull_requests_repo_status ON pull_requests(repo_id, status);
CREATE INDEX idx_pull_requests_created_at ON pull_requests(created_at);
CREATE INDEX idx_pull_requests_status ON pull_requests(status);
CREATE INDEX idx_pull_requests_number ON pull_requests(number);
CREATE INDEX idx_pull_requests_github_id ON pull_requests(github_id);
```

## Issue Entity

The `Issue` entity represents a GitHub issue that is being tracked for a repository.

### Fields

- **id** (`uuid`) - Primary key, auto-generated UUID
- **repoId** (`uuid`, indexed) - Foreign key to Repository entity
- **number** (`int`, indexed) - Issue number from GitHub
- **createdAt** (`timestamp`, indexed) - When the issue was created
- **status** (`string`, default: 'open', indexed) - Issue status: 'open' or 'closed'

### Additional Fields

- **githubId** (`string`, indexed) - GitHub issue ID
- **userId** (`uuid`) - Foreign key to User entity
- **title** (`string`, nullable) - Issue title
- **updatedAt** (`timestamp`) - Record last update timestamp

### Relationships

- **repo** - Many-to-one relationship with Repository entity
- **user** - Many-to-one relationship with User entity

### Indexes

- Index on `repoId` for faster repository issue queries
- Composite index on `repoId` and `status` for filtering by repository and status
- Index on `createdAt` for stale issue detection (30+ days)
- Index on `status` for status-based queries
- Index on `number` for issue number lookups
- Index on `githubId` for GitHub API synchronization

### Usage Example

```typescript
import { Issue } from './entities/issue.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository, LessThan } from 'typeorm';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue)
    private readonly issueRepository: TypeOrmRepository<Issue>,
  ) {}

  async findByRepoId(repoId: string): Promise<Issue[]> {
    return this.issueRepository.find({
      where: { repoId },
      order: { createdAt: 'DESC' },
    });
  }

  async getStaleIssues(days: number = 30): Promise<Issue[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    return this.issueRepository.find({
      where: {
        status: 'open',
        updatedAt: LessThan(date),
      },
    });
  }

  async updateStatus(issueId: string, status: string): Promise<void> {
    await this.issueRepository.update(issueId, { status });
  }

  async getOpenIssuesByRepo(repoId: string): Promise<Issue[]> {
    return this.issueRepository.find({
      where: {
        repoId,
        status: 'open',
      },
    });
  }
}
```

### Database Schema

```sql
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id VARCHAR(255) NOT NULL,
  repo_id UUID NOT NULL REFERENCES repositories(id),
  user_id UUID NOT NULL REFERENCES users(id),
  number INTEGER NOT NULL,
  title VARCHAR(255),
  status VARCHAR(50) DEFAULT 'open' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_issues_repo_id ON issues(repo_id);
CREATE INDEX idx_issues_repo_status ON issues(repo_id, status);
CREATE INDEX idx_issues_created_at ON issues(created_at);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_number ON issues(number);
CREATE INDEX idx_issues_github_id ON issues(github_id);
```
