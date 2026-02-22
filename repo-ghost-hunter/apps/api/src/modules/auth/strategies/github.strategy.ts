import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { AppConfigService } from '../../../config/config.service';
import { GitHubUserDto } from '../dto/github-user.dto';

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
    profile: Profile,
    done: (error: any, user?: GitHubUserDto) => void,
  ): Promise<void> {
    try {
      const { id, username, displayName, photos, emails } = profile;

      const user: GitHubUserDto = {
        id: id.toString(),
        username: username || '',
        displayName: displayName || username || '',
        photos: photos as Array<{ value: string }> | undefined,
        emails: emails as Array<{ value: string; verified?: boolean }> | undefined,
        accessToken,
      };

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
