import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingPricing } from './entities/parking-pricing.entity';
import { ParkingLocation } from '../parking-locations/entities/parking-location.entity';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';

@Module({
  imports: [TypeOrmModule.forFeature([ParkingPricing, ParkingLocation])],
  controllers: [PricingController],
  providers: [PricingService],
})
export class PricingModule {}
