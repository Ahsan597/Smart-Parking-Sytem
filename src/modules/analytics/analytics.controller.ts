import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.PARKING_MANAGER)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('revenue')
  @ResponseMessage('Revenue report fetched successfully')
  getRevenue(@CurrentUser() user: User, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getRevenue(user, query);
  }

  @Get('occupancy')
  @ResponseMessage('Occupancy report fetched successfully')
  getOccupancy(@CurrentUser() user: User, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getOccupancy(user, query);
  }

  @Get('peak-hours')
  @ResponseMessage('Peak hour analytics fetched successfully')
  getPeakHours(@CurrentUser() user: User, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getPeakHours(user, query);
  }
}
