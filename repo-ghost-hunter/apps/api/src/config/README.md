# Configuration Module

Centralized configuration management using `@nestjs/config` with environment variable validation.

## Features

- ✅ Environment variable validation using Joi
- ✅ Type-safe configuration access
- ✅ Centralized config service
- ✅ Support for `.env` and `.env.local` files
- ✅ Default values for development

## Usage

### Import the Config Module

The `AppConfigModule` is already imported globally in `AppModule`, so you can inject `AppConfigService` anywhere:

```typescript
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class MyService {
  constructor(private readonly configService: AppConfigService) {}

  someMethod() {
    const dbConfig = this.configService.database;
    const githubConfig = this.configService.github;
    const isDev = this.configService.isDevelopment;
  }
}
```

### Available Configuration Properties

#### Server Config
- `configService.nodeEnv` - Current environment (development/production/test)
- `configService.port` - Server port (default: 3001)
- `configService.frontendUrl` - Frontend URL for CORS

#### Database Config
```typescript
const db = configService.database;
// db.host, db.port, db.username, db.password, db.database
```

#### GitHub OAuth Config
```typescript
const github = configService.github;
// github.clientId, github.clientSecret, github.callbackUrl
```

#### JWT Config
```typescript
const jwt = configService.jwt;
// jwt.secret, jwt.expiresIn
```

#### Redis Config
```typescript
const redis = configService.redis;
// redis.host, redis.port, redis.url
```

#### Environment Helpers
- `configService.isDevelopment` - Returns true if NODE_ENV is 'development'
- `configService.isProduction` - Returns true if NODE_ENV is 'production'
- `configService.isTest` - Returns true if NODE_ENV is 'test'

## Environment Variables

See `.env.example` for all required environment variables.

### Required Variables

- `DB_PASSWORD` - PostgreSQL password
- `GITHUB_CLIENT_ID` - GitHub OAuth Client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth Client Secret
- `JWT_SECRET` - JWT secret key (minimum 32 characters)

### Optional Variables (with defaults)

- `NODE_ENV` - Environment (default: 'development')
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL (default: 'http://localhost:3000')
- `DB_HOST` - Database host (default: 'localhost')
- `DB_PORT` - Database port (default: 5432)
- `DB_USERNAME` - Database username (default: 'postgres')
- `DB_NAME` - Database name (default: 'repo_ghost_hunter')
- `GITHUB_CALLBACK_URL` - GitHub callback URL
- `REDIS_HOST` - Redis host (default: 'localhost')
- `REDIS_PORT` - Redis port (default: 6379)

## Validation

Environment variables are validated on application startup using Joi schema. If validation fails, the application will not start and display clear error messages.

## File Priority

The config module loads environment variables in this order:
1. `.env.local` (highest priority)
2. `.env`
3. System environment variables
4. Default values
