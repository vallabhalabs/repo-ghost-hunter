import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { AppConfigService } from '../../config/config.service';
import { GitHubUserDto } from './dto/github-user.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
  ) {}

  async handleGitHubCallback(req: Request, res: Response): Promise<void> {
    try {
      const githubUser = req.user as GitHubUserDto;

      if (!githubUser || !githubUser.id) {
        throw new BadRequestException('Invalid GitHub user data');
      }

      // Find or create user
      let user = await this.userRepository.findOne({
        where: { githubId: githubUser.id.toString() },
      });

      const email = this.extractEmail(githubUser);
      const name = githubUser.displayName || githubUser.username || 'GitHub User';
      const avatar = githubUser.photos?.[0]?.value;

      if (!user) {
        // Create new user
        user = this.userRepository.create({
          githubId: githubUser.id.toString(),
          email,
          name,
          avatar,
          accessToken: githubUser.accessToken,
        });
      } else {
        // Update existing user
        user.accessToken = githubUser.accessToken;
        user.avatar = avatar || user.avatar;
        user.name = name || user.name;
        if (email && email !== user.email) {
          user.email = email;
        }
      }

      await this.userRepository.save(user);

      // Generate JWT token
      const token = this.generateToken(user);

      // Set cookie and redirect
      this.setAuthCookie(res, token);

      // Redirect to dashboard
      res.redirect(`${this.configService.frontendUrl}/dashboard`);
    } catch (error) {
      console.error('GitHub OAuth callback error:', error);
      res.redirect(`${this.configService.frontendUrl}/login?error=authentication_failed`);
    }
  }

  async validateUser(payload: any): Promise<User | null> {
    if (!payload || !payload.sub) {
      return null;
    }

    try {
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });
      return user;
    } catch (error) {
      console.error('Error validating user:', error);
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'name', 'avatar', 'createdAt'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  }

  private extractEmail(githubUser: GitHubUserDto): string {
    // Try to get verified email first
    const verifiedEmail = githubUser.emails?.find((email) => email.verified)?.value;
    if (verifiedEmail) {
      return verifiedEmail;
    }

    // Fallback to first email
    const firstEmail = githubUser.emails?.[0]?.value;
    if (firstEmail) {
      return firstEmail;
    }

    // Fallback to username-based email
    return `${githubUser.username}@users.noreply.github.com`;
  }

  private generateToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      githubId: user.githubId,
    });
  }

  private setAuthCookie(res: Response, token: string): void {
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: this.configService.isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }
}
