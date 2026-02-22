# @repo-ghost-hunter/config

Shared configuration for the Repo Ghost Hunter monorepo.

## Contents

- **tsconfig/** – Base TypeScript configs for apps and packages
- **eslint/** – Shared ESLint config

## TypeScript Configuration

### Base Config (`tsconfig.json`)
The root TypeScript configuration with common compiler options:
- Strict type checking
- ES module interop
- Consistent file naming
- JSON module resolution

### Framework-Specific Configs

#### `tsconfig/base.json`
Base configuration for Node.js packages:
- ES2022 target
- NodeNext module resolution
- Declaration files enabled

#### `tsconfig/nestjs.json`
Configuration for NestJS backend (`apps/api`):
- CommonJS modules
- Decorator support
- ES2021 target
- Source maps enabled

#### `tsconfig/nextjs.json`
Configuration for Next.js frontend (`apps/web`):
- ESNext modules
- JSX support
- DOM libraries
- Next.js plugin

#### `tsconfig/react.json`
Configuration for React packages (`packages/ui`):
- React JSX transform
- ESNext modules
- DOM libraries
- Declaration files

## Usage

### In Apps

**Next.js App** (`apps/web/tsconfig.json`):
```json
{
  "extends": "../../packages/config/tsconfig/nextjs.json",
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }
  }
}
```

**NestJS App** (`apps/api/tsconfig.json`):
```json
{
  "extends": "../../packages/config/tsconfig/nestjs.json",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

### In Packages

**React Package** (`packages/ui/tsconfig.json`):
```json
{
  "extends": "../config/tsconfig/react.json"
}
```

## Benefits

- **Consistency**: All apps and packages use the same base TypeScript settings
- **Maintainability**: Update shared configs in one place
- **Type Safety**: Strict type checking enabled across the monorepo
- **Framework Support**: Optimized configs for Next.js, NestJS, and React
