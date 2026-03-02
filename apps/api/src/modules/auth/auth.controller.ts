import { Controller, Get, UseGuards, Req, Res, Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Initiates GitHub OAuth flow
   * 
   * This endpoint redirects the user to GitHub's authorization page.
   * After the user authorizes, GitHub will redirect back to /auth/github/callback
   * 
   * @query state - Optional state parameter for CSRF protection
   * @returns Redirects to GitHub authorization page
   * 
   * @example
   * GET /api/auth/github
   * GET /api/auth/github?state=random_csrf_token
   */
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth(@Req() req: Request) {
    // Passport GitHub strategy automatically handles:
    // 1. Redirecting to GitHub authorization URL
    // 2. Including client_id, redirect_uri, scope, and state parameters
    // 3. The user will be redirected to GitHub's authorization page
    
    // If we reach here, it means the guard didn't redirect (shouldn't happen)
    // This is a fallback
    return {
      message: 'Redirecting to GitHub...',
      url: 'https://github.com/login/oauth/authorize',
    };
  }

  /**
   * GitHub OAuth callback endpoint
   * Handles the callback from GitHub after user authorization
   */
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: Request, @Res() res: Response) {
    return this.authService.handleGitHubCallback(req, res);
  }

  /**
   * Get current authenticated user profile
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User) {
    return this.authService.getUserProfile(user.id);
  }

  /**
   * Logout endpoint
   * Clears the authentication cookie
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res() res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return res.json({ message: 'Logged out successfully' });
  }

  /**
   * Check authentication status
   */
  @Get('status')
  @UseGuards(JwtAuthGuard)
  async checkAuth(@CurrentUser() user: User) {
    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
