// User related types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  name?: string;
}

// Repository related types
export interface Repository {
  id: string;
  githubId: number;
  name: string;
  fullName: string;
  description?: string;
  url: string;
  language?: string;
  stars: number;
  forks: number;
  issues: number;
  lastCommit?: Date;
  isActive: boolean;
  healthScore: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRepositoryData {
  githubId: number;
  name: string;
  fullName: string;
  description?: string;
  url: string;
  language?: string;
  stars: number;
  forks: number;
  issues: number;
  lastCommit?: Date;
  userId: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Health score calculation types
export interface HealthMetrics {
  commitFrequency: number;
  issueResolutionTime: number;
  pullRequestFrequency: number;
  contributorActivity: number;
  documentationQuality: number;
}

export interface HealthScoreBreakdown {
  overall: number;
  metrics: HealthMetrics;
  lastCalculated: Date;
}

// GitHub API types
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
  updated_at: string;
  created_at: string;
  default_branch: string;
  owner: {
    login: string;
    id: number;
    type: string;
  };
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  url: string;
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AuthSession {
  user: AuthUser;
  expires: string;
}

// Environment variable types
export interface EnvConfig {
  DATABASE_URL: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  NODE_ENV: 'development' | 'production' | 'test';
}
