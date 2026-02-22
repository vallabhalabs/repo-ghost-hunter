import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { AppConfigService } from '../../config/config.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
  ) {}

  async handleGitHubCallback(req: Request, res: Response) {
    const githubUser = req.user as any;
    
    // Find or create user
    let user = await this.userRepository.findOne({
      where: { githubId: githubUser.id.toString() },
    });

    if (!user) {
      user = this.userRepository.create({
        githubId: githubUser.id.toString(),
        email: githubUser.emails?.[0]?.value || githubUser.username,
        name: githubUser.displayName || githubUser.username,
        avatar: githubUser.photos?.[0]?.value,
        accessToken: githubUser.accessToken,
      });
    } else {
      user.accessToken = githubUser.accessToken;
      user.avatar = githubUser.photos?.[0]?.value || user.avatar;
      user.name = githubUser.displayName || githubUser.username || user.name;
    }

    await this.userRepository.save(user);

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    // Set cookie and redirect
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: this.configService.isProduction,
      sameSite: 'lax',
    });

    return res.redirect(`${this.configService.frontendUrl}/dashboard`);
  }

  async validateUser(payload: any) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    return user;
  }
}
