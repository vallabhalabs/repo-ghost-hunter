# Repo Ghost Hunter

A production-grade SaaS application that monitors GitHub repository activity to detect inactive or unhealthy repositories. Built with modern web technologies and designed for scalability.

## Architecture Overview

This is a **Turbo monorepo** that follows enterprise-grade architecture patterns:

```
repo-ghost-hunter/
├── apps/
│   ├── web/                # Next.js 14 frontend (App Router)
│   └── api/                # NestJS backend API
├── packages/
│   ├── ui/                 # Shared UI components
│   ├── database/           # Prisma schema + client
│   ├── config/             # Shared TypeScript/ESLint configs
│   └── types/              # Shared TypeScript types
├── infrastructure/
│   ├── docker/             # Docker configuration
│   └── scripts/            # Development scripts
└── .github/workflows/      # CI/CD pipelines
```

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** (strict mode)
- **Tailwind CSS** for styling
- **React Server Components**

### Backend
- **NestJS** for API server
- **Prisma** ORM with PostgreSQL
- **JWT** authentication
- **Redis** for caching

### Infrastructure
- **Turbo** for monorepo management
- **pnpm** for package management
- **Docker** & Docker Compose
- **GitHub Actions** for CI/CD

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd repo-ghost-hunter
   ```

2. **Run the setup script**
   ```bash
   chmod +x infrastructure/scripts/setup.sh
   ./infrastructure/scripts/setup.sh
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development servers**
   ```bash
   pnpm run dev
   ```

   Or start services individually:
   ```bash
   pnpm run dev:web  # Frontend at http://localhost:3000
   pnpm run dev:api  # Backend at http://localhost:3001
   ```

### Docker Development

For a complete development environment with Docker:

```bash
cd infrastructure/docker
docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis cache
- API server
- Web frontend

## OAuth Authentication Flow

The application uses GitHub OAuth for authentication with the following flow:

### 1. Initiate OAuth
```
GET /api/auth/github
```

- Redirects user to GitHub authorization page
- Includes required scopes and CSRF protection via state parameter

### 2. GitHub Authorization
- User authorizes the application on GitHub
- GitHub redirects back to the callback URL

### 3. Handle Callback
```
GET /api/auth/github/callback?code=xxx&state=xxx
```

- Exchange authorization code for access token
- Extract user profile data (id, username, email, avatar)
- Store encrypted access token in database
- Generate JWT token for session management

### 4. JWT Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "username": "github-username",
    "avatar": "https://avatars.githubusercontent.com/u/123456?v=4"
  }
}
```

### 5. Authenticated Requests
Include JWT token in Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Environment Variables

### Required Variables

Create `.env.local` with the following required variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/repo_ghost_hunter"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"

# JWT Authentication
JWT_SECRET="your-32-character-minimum-secret-key"

# Application URLs
FRONTEND_URL="http://localhost:3000"
GITHUB_CALLBACK_URL="http://localhost:3001/api/auth/github/callback"
```

### Optional Variables

```env
# Redis (for caching)
REDIS_URL="redis://localhost:6379"

# Encryption (for access tokens)
ENCRYPTION_KEY="your-32-character-encryption-key"

# Environment
NODE_ENV="development"  # development | production | test
```

### GitHub OAuth Setup

1. **Create GitHub OAuth App**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Click "New OAuth App"
   - Set Authorization callback URL: `http://localhost:3001/api/auth/github/callback`
   - For production, use your actual domain

2. **Configure Environment**
   ```env
   GITHUB_CLIENT_ID="your-client-id"
   GITHUB_CLIENT_SECRET="your-client-secret"
   ```

3. **Required Scopes**
   The app requests the following GitHub scopes:
   - `user:email` - Read user email
   - `read:org` - Read organization data (if applicable)
   - `read:user` - Read user profile data

## Project Structure

### Applications (`apps/`)

- **`apps/web`** - Next.js frontend application
- **`apps/api`** - NestJS backend API

### Packages (`packages/`)

- **`packages/ui`** - Reusable React components
- **`packages/database`** - Prisma schema and database client
- **`packages/config`** - Shared ESLint, TypeScript configurations
- **`packages/types`** - Shared TypeScript type definitions

### Infrastructure (`infrastructure/`)

- **`infrastructure/docker/`** - Docker configuration files
- **`infrastructure/scripts/`** - Development and deployment scripts

## Available Scripts

### Root Level Commands

```bash
# Development
pnpm run dev              # Start all services
pnpm run dev:web          # Start only web app
pnpm run dev:api          # Start only API

# Building
pnpm run build            # Build all packages
pnpm run build:web        # Build only web app
pnpm run build:api        # Build only API

# Quality Assurance
pnpm run lint             # Lint all packages
pnpm run lint:fix         # Fix linting issues
pnpm run type-check       # Type check all packages
pnpm run test             # Run all tests
pnpm run test:watch       # Run tests in watch mode

# Database
pnpm run db:generate      # Generate Prisma client
pnpm run db:push          # Push schema to database
pnpm run db:migrate       # Run database migrations
pnpm run db:studio        # Open Prisma Studio
pnpm run db:seed          # Seed database with sample data

# Utilities
pnpm run clean            # Clean build artifacts
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Authentication secret
- `NEXTAUTH_URL` - Application URL
- `GITHUB_CLIENT_ID` - GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth app client secret

### Optional Variables
- `REDIS_URL` - Redis connection string for caching
- `GITHUB_API_TOKEN` - GitHub personal access token
- `SENTRY_DSN` - Sentry error tracking
- `GOOGLE_ANALYTICS_ID` - Google Analytics

## Development Workflow

1. **Create a feature branch** from `develop`
2. **Make changes** following the established patterns
3. **Run tests and linting** locally
4. **Submit a pull request** to `develop`
5. **Code review** and automated CI/CD checks
6. **Merge** to `develop` for staging
7. **Deploy** to production from `main`

## Monorepo Benefits

- **Shared Dependencies**: Common packages are shared across applications
- **Atomic Commits**: Changes to multiple packages can be committed together
- **Consistent Tooling**: Unified linting, formatting, and TypeScript configuration
- **Faster CI**: Intelligent caching and parallel builds
- **Scalability**: Easy to add new applications and packages

## Health Score Algorithm

The application calculates repository health scores based on:

- **Commit Frequency** - Recent activity and consistency
- **Issue Resolution** - How quickly issues are addressed
- **Pull Request Activity** - Community engagement
- **Contributor Activity** - Number and diversity of contributors
- **Documentation Quality** - Presence and quality of README, docs

## Authentication

- **GitHub OAuth** for user authentication
- **JWT tokens** for session management
- **Role-based access control** (RBAC) ready

## Deployment

### Production Deployment

1. **Build all applications**
   ```bash
   pnpm run build
   ```

2. **Run database migrations**
   ```bash
   pnpm run db:migrate
   ```

3. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment-Specific Configurations

- **Development**: Local development with hot reload
- **Staging**: Production-like environment for testing
- **Production**: Optimized builds with security hardening

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions and support:

- Create an issue in the GitHub repository
- Check the documentation in `/docs`
- Review the FAQ in the wiki

## Roadmap

- [ ] Real-time repository monitoring
- [ ] Advanced health score algorithms
- [ ] Team collaboration features
- [ ] Custom alert configurations
- [ ] Mobile application
- [ ] API rate limiting and analytics
- [ ] Multi-tenant support

---

**Built with ❤️ for the open-source community**

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
