import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { BookingStatus } from './entities/booking.entity';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ResponseMessage('Slot reserved successfully')
  create(@CurrentUser() user: User, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user, dto);
  }

  @Get()
  @ResponseMessage('Booking history fetched successfully')
  findAll(@CurrentUser() user: User, @Query('status') status?: BookingStatus) {
    return this.bookingsService.findAllForUser(user.id, status);
  }

  @Get(':id')
  @ResponseMessage('Booking fetched successfully')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookingsService.findOneForUser(user, id);
  }

  @Patch(':id/cancel')
  @ResponseMessage('Reservation cancelled successfully')
  cancel(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookingsService.cancel(user, id);
  }

  @Patch(':id/check-in')
  @ResponseMessage('Checked in successfully')
  checkIn(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookingsService.checkIn(user, id);
  }

  @Patch(':id/check-out')
  @ResponseMessage('Checked out successfully')
  checkOut(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: CheckoutDto) {
    return this.bookingsService.checkOut(user, id, dto);
  }

  @Patch(':id/force-check-out')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARKING_MANAGER)
  @ResponseMessage('Booking checked out by manager')
  forceCheckOut(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: CheckoutDto) {
    return this.bookingsService.forceCheckOut(user, id, dto);
  }
}
