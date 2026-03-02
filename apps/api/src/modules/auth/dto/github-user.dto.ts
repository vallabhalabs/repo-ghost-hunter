export interface GitHubUserDto {
  id: string;
  username: string;
  displayName?: string;
  photos?: Array<{ value: string }>;
  emails?: Array<{ value: string; verified?: boolean }>;
  accessToken: string;
}
