import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ParkingLocationsService } from './parking-locations.service';
import { CreateParkingLocationDto } from './dto/create-parking-location.dto';
import { UpdateParkingLocationDto } from './dto/update-parking-location.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Controller('parking-locations')
export class ParkingLocationsController {
  constructor(private readonly locationsService: ParkingLocationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ResponseMessage('Parking location created successfully')
  create(@Body() dto: CreateParkingLocationDto) {
    return this.locationsService.create(dto);
  }

  @Get()
  @ResponseMessage('Parking locations fetched successfully')
  findAll() {
    return this.locationsService.findAll();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARKING_MANAGER)
  @ResponseMessage('Your parking locations fetched successfully')
  findMine(@CurrentUser() user: User) {
    return this.locationsService.findMine(user.id);
  }

  @Get(':id')
  @ResponseMessage('Parking location fetched successfully')
  findOne(@Param('id') id: string) {
    return this.locationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ResponseMessage('Parking location updated successfully')
  update(@Param('id') id: string, @Body() dto: UpdateParkingLocationDto) {
    return this.locationsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ResponseMessage('Parking location deleted successfully')
  remove(@Param('id') id: string) {
    return this.locationsService.remove(id);
  }
}
