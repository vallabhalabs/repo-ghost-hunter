import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { User } from '@repo/database';
import { UsersService } from '../users/users.service';
import { GitHubUser } from './dto/github-user.dto';
import { AuthResponse } from './dto/auth-response.dto';
import { EncryptionUtil } from '../../common/utils/encryption.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async handleGitHubCallback(req: Request): Promise<AuthResponse> {
    try {
      const githubUser = req.user as GitHubUser;

      if (!githubUser || !githubUser.id) {
        throw new BadRequestException('Invalid GitHub user data');
      }

      const email = this.extractEmail(githubUser);
      if (!email) {
        throw new BadRequestException('Email is required for authentication');
      }

      // Encrypt access token before storing
      const encryptedAccessToken = await EncryptionUtil.encrypt(githubUser.access_token || '');

      // Upsert user using Prisma
      const user = await this.usersService.upsertByGitHubId(
        githubUser.id.toString(),
        {
          email,
          name: githubUser.name || githubUser.login,
          avatar: githubUser.avatar_url,
          accessToken: encryptedAccessToken,
        },
      );

      // Generate JWT token
      const token = this.generateToken(user);

      this.logger.log(`User authenticated successfully: ${user.id}`);

      return {
        access_token: token,
        user: {
          id: user.id,
          username: githubUser.login,
          avatar: user.avatar || undefined,
        },
      };
    } catch (error) {
      this.logger.error('GitHub OAuth callback error:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Authentication failed');
    }
  }

  async validateUser(payload: any): Promise<User | null> {
    if (!payload || !payload.sub) {
      return null;
    }

    try {
      const user = await this.usersService.findById(payload.sub);
      return user;
    } catch (error) {
      this.logger.error('Error validating user:', error);
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<Partial<User>> {
    return this.usersService.getProfile(userId);
  }

  private extractEmail(githubUser: GitHubUser): string | null {
    // Try to get verified primary email first
    const verifiedPrimaryEmail = githubUser.emails?.find(
      (email) => email.verified && email.primary,
    )?.email;
    
    if (verifiedPrimaryEmail) {
      return verifiedPrimaryEmail;
    }

    // Try to get any verified email
    const verifiedEmail = githubUser.emails?.find((email) => email.verified)?.email;
    if (verifiedEmail) {
      return verifiedEmail;
    }

    // Use direct email if available
    if (githubUser.email) {
      return githubUser.email;
    }

    // Fallback to primary email even if not verified
    const primaryEmail = githubUser.emails?.find((email) => email.primary)?.email;
    if (primaryEmail) {
      return primaryEmail;
    }

    // Fallback to first email
    const firstEmail = githubUser.emails?.[0]?.email;
    if (firstEmail) {
      return firstEmail;
    }

    return null;
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      github_id: user.githubId,
      username: user.name || user.email,
    };

    return this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
  }
}
