import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    handleGitHubCallback: jest.fn(),
    getUserProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /auth/github', () => {
    it('should be defined', () => {
      expect(controller.githubAuth).toBeDefined();
    });
  });

  describe('GET /auth/github/callback', () => {
    it('should call handleGitHubCallback', async () => {
      const mockReq = {} as any;
      const mockRes = {
        redirect: jest.fn(),
        cookie: jest.fn(),
      } as any;

      await controller.githubCallback(mockReq, mockRes);
      expect(authService.handleGitHubCallback).toHaveBeenCalledWith(mockReq, mockRes);
    });
  });
});
