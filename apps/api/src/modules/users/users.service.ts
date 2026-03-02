import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@repo/database';
import { User } from '@repo/database';
import { CreateUserData, UpdateUserData } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByGitHubId(githubId: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { githubId },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error finding user by GitHub ID');
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error finding user by ID');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error finding user by email');
    }
  }

  async create(userData: CreateUserData): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: userData,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('User with this GitHub ID already exists');
      }
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async update(id: string, userData: UpdateUserData): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: userData,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new BadRequestException('User not found');
      }
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async upsertByGitHubId(githubId: string, userData: CreateUserData): Promise<User> {
    try {
      return await this.prisma.user.upsert({
        where: { githubId },
        update: userData,
        create: {
          githubId,
          ...userData,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error upserting user');
    }
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching user profile');
    }
  }
}
