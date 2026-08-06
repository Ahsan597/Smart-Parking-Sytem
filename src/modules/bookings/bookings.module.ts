import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Slot } from '../slots/entities/slot.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Payment } from '../payments/entities/payment.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingsExpiryService } from './bookings-expiry.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Slot, Vehicle, Payment])],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsExpiryService],
})
export class BookingsModule {}
