import { 
  Controller, 
  Post, 
  HttpCode, 
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SyncService } from './sync.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async syncUserRepositories(@CurrentUser() user: any) {
    return this.syncService.syncUserRepositories(user.id);
  }
}
