import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  HttpCode, 
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('orgs')
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUserOrganizations(@CurrentUser() user: any) {
    return this.organizationService.getUserOrganizations(user.id);
  }

  @Get(':orgId')
  @HttpCode(HttpStatus.OK)
  async getOrganizationById(
    @Param('orgId') orgId: string,
    @CurrentUser() user: any,
  ) {
    return this.organizationService.getOrganizationById(user.id, orgId);
  }

  @Post(':login/sync')
  @HttpCode(HttpStatus.OK)
  async syncOrganization(
    @Param('login') login: string,
    @CurrentUser() user: any,
  ) {
    return this.organizationService.syncOrganizationRepositories(user.id, login);
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async syncAllOrganizations(@CurrentUser() user: any) {
    return this.organizationService.syncAllUserOrganizations(user.id);
  }
}
