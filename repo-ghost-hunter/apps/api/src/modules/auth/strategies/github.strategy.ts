import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AppConfigService } from '../../../config/config.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: AppConfigService) {
    const githubConfig = configService.github;
    super({
      clientID: githubConfig.clientId,
      clientSecret: githubConfig.clientSecret,
      callbackURL: githubConfig.callbackUrl,
      scope: ['user:email', 'repo'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any) => void,
  ) {
    const { id, username, displayName, photos, emails } = profile;
    
    const user = {
      id,
      username,
      displayName,
      photos,
      emails,
      accessToken,
    };

    done(null, user);
  }
}
