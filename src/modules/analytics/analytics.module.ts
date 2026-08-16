import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../payments/entities/payment.entity';
import { Slot } from '../slots/entities/slot.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { ParkingLocation } from '../parking-locations/entities/parking-location.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Slot, Booking, ParkingLocation])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
