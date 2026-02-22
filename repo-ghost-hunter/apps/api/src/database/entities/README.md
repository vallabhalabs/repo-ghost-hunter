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
