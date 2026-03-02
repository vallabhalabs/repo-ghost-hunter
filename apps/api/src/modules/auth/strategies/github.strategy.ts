import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { GitHubUser } from '../dto/github-user.dto';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/api/auth/github/callback',
      scope: ['user:email', 'read:user'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: GitHubUser) => void,
  ): Promise<void> {
    try {
      const { id, login, name, avatar_url, emails } = profile;

      const githubUser: GitHubUser = {
        id,
        login: login || '',
        name: name || login || '',
        avatar_url,
        emails: emails as Array<{ email: string; verified: boolean }> | undefined,
        access_token: accessToken,
      };

      done(null, githubUser);
    } catch (error) {
      done(error, null);
    }
  }
}
