# Database Module

TypeORM configuration and database setup for PostgreSQL.

## Setup

### Prerequisites

- PostgreSQL 14+ installed and running
- Database created: `repo_ghost_hunter` (or as specified in `.env`)

### Environment Variables

Configure these in your `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=repo_ghost_hunter
```

### Create Database

```sql
CREATE DATABASE repo_ghost_hunter;
```

Or using command line:

```bash
createdb repo_ghost_hunter
```

## Entities

The following entities are defined:

- **User** - GitHub user information and access tokens
- **Repository** - GitHub repository metadata
- **PullRequest** - Pull request tracking
- **Issue** - Issue tracking
- **ActivityLog** - Repository activity logs

## Development Mode

In development mode (`NODE_ENV=development`), TypeORM will:
- Automatically synchronize the database schema (`synchronize: true`)
- Log all SQL queries (`logging: true`)

⚠️ **Warning**: Never use `synchronize: true` in production!

## Migrations

### Generate Migration

```bash
npm run migration:generate -- src/database/migrations/InitialMigration
```

### Create Empty Migration

```bash
npm run migration:create -- src/database/migrations/AddNewColumn
```

### Run Migrations

```bash
npm run migration:run
```

### Revert Last Migration

```bash
npm run migration:revert
```

### Show Migration Status

```bash
npm run migration:show
```

## Connection Pooling

The database connection uses connection pooling with these settings:

- **Max connections**: 10
- **Min connections**: 2
- **Idle timeout**: 30 seconds
- **Connection timeout**: 2 seconds

## Production

In production:

1. Set `NODE_ENV=production`
2. `synchronize` will be automatically disabled
3. Use migrations to manage schema changes
4. SSL connection is enabled (if configured)

## Health Check

The database connection status is available via the health endpoint:

```bash
GET /api/health
```

Response includes database connection status:

```json
{
  "status": "ok",
  "database": {
    "connected": true,
    "database": "repo_ghost_hunter",
    "host": "localhost",
    "port": 5432
  }
}
```

## Troubleshooting

### Connection Refused

- Ensure PostgreSQL is running
- Check `DB_HOST` and `DB_PORT` in `.env`
- Verify firewall settings

### Authentication Failed

- Verify `DB_USERNAME` and `DB_PASSWORD` in `.env`
- Check PostgreSQL user permissions

### Database Does Not Exist

- Create the database manually
- Or update `DB_NAME` in `.env` to an existing database

### Migration Errors

- Ensure database is accessible
- Check migration files for syntax errors
- Review migration history in `migrations` table
