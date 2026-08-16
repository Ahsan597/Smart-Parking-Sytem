import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ParkingLocationsService } from './parking-locations.service';
import { CreateParkingLocationDto } from './dto/create-parking-location.dto';
import { UpdateParkingLocationDto } from './dto/update-parking-location.dto';
import { SearchParkingLocationsDto } from './dto/search-parking-locations.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { BookingStatus } from '../bookings/entities/booking.entity';

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
  findAll(@Query() query: SearchParkingLocationsDto) {
    return this.locationsService.search(query);
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

  @Get(':id/available-slots')
  @ResponseMessage('Available slots fetched successfully')
  findAvailableSlots(@Param('id') id: string) {
    return this.locationsService.findAvailableSlots(id);
  }

  @Get(':id/bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARKING_MANAGER)
  @ResponseMessage('Bookings fetched successfully')
  findAllBookings(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Query('status') status?: BookingStatus,
  ) {
    return this.locationsService.findAllBookings(user, id, status);
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
