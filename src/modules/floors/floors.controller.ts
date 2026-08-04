import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FloorsService } from './floors.service';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Controller()
export class FloorsController {
  constructor(private readonly floorsService: FloorsService) {}

  @Post('parking-locations/:locationId/floors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARKING_MANAGER)
  create(
    @Param('locationId') locationId: string,
    @Body() dto: CreateFloorDto,
    @CurrentUser() user: User,
  ) {
    return this.floorsService.create(locationId, dto, user);
  }

  @Get('parking-locations/:locationId/floors')
  findAllForLocation(@Param('locationId') locationId: string) {
    return this.floorsService.findAllForLocation(locationId);
  }

  @Get('floors/:id')
  findOne(@Param('id') id: string) {
    return this.floorsService.findOne(id);
  }

  @Patch('floors/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARKING_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateFloorDto, @CurrentUser() user: User) {
    return this.floorsService.update(id, dto, user);
  }

  @Delete('floors/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARKING_MANAGER)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.floorsService.remove(id, user);
  }
}
