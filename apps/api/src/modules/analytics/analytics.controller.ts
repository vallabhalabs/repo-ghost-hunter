import { 
  Controller, 
  Get, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnalyticsQuerySchema } from './dto/analytics.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @HttpCode(HttpStatus.OK)
  async getOverview(@CurrentUser() user: any) {
    return this.analyticsService.getOverview(user.id);
  }

  @Get('repos')
  @HttpCode(HttpStatus.OK)
  async getRepositories(
    @CurrentUser() user: any,
    @Query() query: any,
  ) {
    const validatedQuery = AnalyticsQuerySchema.parse(query);
    return this.analyticsService.getRepositories(user.id, validatedQuery);
  }

  @Get('activity-trend')
  @HttpCode(HttpStatus.OK)
  async getActivityTrend(@CurrentUser() user: any) {
    return this.analyticsService.getActivityTrend(user.id);
  }
}
