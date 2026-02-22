# Repo Ghost Hunter

A full-stack SaaS application that connects to GitHub and monitors repository activity to detect inactive or unhealthy repositories.

## Overview

Repo Ghost Hunter helps developers and teams identify repositories that need attention by tracking:
- Repository activity and commit frequency
- Stale pull requests and issues
- Repository health scores
- Contributor activity

## Features

- 🔐 **GitHub OAuth Authentication** - Secure login with GitHub
- 📊 **Repository Monitoring** - Track all your repositories in one place
- 🔍 **Activity Scanning** - Daily background jobs collect repository metrics
- ⚠️ **Stale Detection** - Automatically detect inactive repos, stale PRs, and issues
- 📈 **Health Scoring** - Calculate repository health scores (0-100)
- 📧 **Weekly Reports** - Email summaries of repository health
- 📱 **Modern Dashboard** - Clean, intuitive UI with charts and analytics

## Tech Stack

### Frontend
- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Chart.js** for analytics

### Backend
- **NestJS**
- **Node.js**
- **REST API**

### Database
- **PostgreSQL**

### Queue / Jobs
- **Redis** with **BullMQ**

### Authentication
- **GitHub OAuth**

### External APIs
- **GitHub REST API**

## Project Structure

```
repo-ghost-hunter/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── database/     # Database schemas and migrations
│   └── ui/           # Shared UI components
├── infrastructure/
│   ├── docker/       # Docker configurations
│   └── scripts/      # Deployment and utility scripts
├── README.md
├── LICENSE
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- GitHub OAuth App credentials

### Environment Variables

Create `.env` files in both `apps/web` and `apps/api`:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/repo_ghost_hunter

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret
```

### Installation

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev
```

## Core Features

### 1. GitHub Authentication
Users sign in with GitHub OAuth and their access tokens are stored securely.

### 2. Repository Sync
After login, fetch user repositories using GitHub API and store metadata in the database.

### 3. Activity Scanner
Background job runs daily and collects:
- Latest commit
- Open pull requests
- Open issues
- Contributors

### 4. Stale Detection Rules
- **Inactive Repo**: No commits in 30 days
- **Stale PR**: PR open for more than 14 days
- **Stale Issue**: Issue inactive for 30 days

### 5. Repo Health Score
Calculated from 0 to 100 based on:
- Commit frequency
- PR merge time
- Issue response time
- Active contributors

### 6. Dashboard
View:
- List of repositories
- Health scores
- Last commit dates
- Stale pull requests
- Open issues

### 7. Weekly Reports
Automated email summaries with repository health metrics.

## Development

```bash
# Start all services
npm run dev

# Start frontend only
npm run dev:web

# Start backend only
npm run dev:api

# Run tests
npm test

# Build for production
npm run build
```

## Deployment

- **Frontend**: Deploy on Vercel
- **Backend**: Deploy on Node server (Railway, Render, etc.)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
