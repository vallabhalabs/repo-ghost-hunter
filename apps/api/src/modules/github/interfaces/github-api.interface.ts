export interface GitHubApiConfig {
  baseUrl: string;
  token: string;
  timeout: number;
  maxRetries: number;
}

export interface GitHubRepositoryResponse {
  data: Array<{
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    default_branch: string;
    updated_at: string;
    owner: {
      login: string;
      id: number;
      avatar_url?: string;
    };
  }>;
}

export interface GitHubPullRequestsResponse {
  data: Array<{
    id: number;
    number: number;
    title: string;
    state: string;
    user: {
      login: string;
      id: number;
      avatar_url?: string;
    };
    created_at: string;
    updated_at: string;
    head: {
      ref: string;
      sha: string;
    };
    base: {
      ref: string;
      sha: string;
    };
  }>;
}

export interface GitHubIssuesResponse {
  data: Array<{
    id: number;
    number: number;
    title: string;
    state: string;
    user: {
      login: string;
      id: number;
      avatar_url?: string;
    };
    created_at: string;
    updated_at: string;
  }>;
}

export interface GitHubCommitsResponse {
  data: Array<{
    sha: string;
    commit: {
      author: {
        name: string;
        email?: string;
        date: string;
      };
      message: string;
    };
    url: string;
  }>;
}

export interface GitHubRateLimitInfo {
  limit: number;
  remaining: number;
  reset: string;
  used: number;
}

export interface GitHubRateLimitResponse {
  resources: {
    core: GitHubRateLimitInfo;
  };
  rate: GitHubRateLimitInfo;
}
