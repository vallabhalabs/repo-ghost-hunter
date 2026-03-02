export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface GitHubConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  url?: string;
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  frontendUrl: string;
  database: DatabaseConfig;
  github: GitHubConfig;
  jwt: JwtConfig;
  redis: RedisConfig;
}
