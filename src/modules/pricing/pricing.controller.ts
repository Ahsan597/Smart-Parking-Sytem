import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { PricingService } from './pricing.service';
import { SetPricingDto } from './dto/set-pricing.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Controller('parking-locations/:locationId/pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARKING_MANAGER)
  @ResponseMessage('Pricing saved successfully')
  setPricing(
    @Param('locationId') locationId: string,
    @Body() dto: SetPricingDto,
    @CurrentUser() user: User,
  ) {
    return this.pricingService.setPricing(locationId, dto, user);
  }

  @Get()
  @ResponseMessage('Pricing fetched successfully')
  getPricing(@Param('locationId') locationId: string) {
    return this.pricingService.getPricing(locationId);
  }
}
