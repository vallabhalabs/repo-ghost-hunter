# Repo Ghost Hunter - API

NestJS backend API for Repo Ghost Hunter.

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Database
- **TypeORM** - ORM
- **Passport** - Authentication (GitHub OAuth + JWT)
- **BullMQ** - Job queue (Redis)
- **Axios** - HTTP client for GitHub API

## Project Structure

```
src/
├── modules/
│   ├── auth/          # Authentication (GitHub OAuth, JWT)
│   ├── github/        # GitHub API integration
│   ├── repos/         # Repository management
│   ├── issues/        # Issue tracking
│   ├── pullrequests/  # Pull request management
│   ├── analytics/     # Analytics and health scoring
│   ├── reports/       # Weekly reports
│   └── scheduler/     # Background jobs
├── database/
│   ├── entities/      # TypeORM entities
│   └── database.module.ts
├── common/            # Shared utilities
├── app.module.ts      # Root module
└── main.ts            # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+ (for BullMQ)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

### Environment Variables

See `.env.example` for required environment variables:

- `GITHUB_CLIENT_ID` - GitHub OAuth App Client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth App Client Secret
- `JWT_SECRET` - Secret key for JWT tokens
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

### Running the App

```bash
# Development
npm run dev

# Production build
npm run build
npm run start:prod
```

## API Endpoints

### Authentication
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - GitHub OAuth callback
- `GET /api/auth/me` - Get current user (protected)
- `GET /api/auth/logout` - Logout (protected)

### Repositories
- `GET /api/repos` - Get user repositories (protected)
- `POST /api/repos/sync` - Sync repositories from GitHub (protected)
- `GET /api/repos/:id` - Get repository details (protected)

### Issues
- `GET /api/issues/repo/:repoId` - Get repository issues (protected)
- `GET /api/issues/stale` - Get stale issues (protected)

### Pull Requests
- `GET /api/pull-requests/repo/:repoId` - Get repository PRs (protected)
- `GET /api/pull-requests/stale` - Get stale PRs (protected)

### Analytics
- `GET /api/analytics/repo/:repoId/health-score` - Get health score (protected)
- `GET /api/analytics/repo/:repoId/activity` - Get activity logs (protected)

### Reports
- `GET /api/reports/weekly` - Generate weekly report (protected)
- `POST /api/reports/send-weekly` - Send weekly report email (protected)

## Background Jobs

- **Daily Repository Scan** - Runs at 2 AM daily
- **Weekly Reports** - Runs every Monday at 9 AM

## Database Schema

See `src/database/entities/` for entity definitions:
- Users
- Repositories
- PullRequests
- Issues
- ActivityLogs

## License

MIT
