import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingLocation } from './entities/parking-location.entity';
import { User } from '../users/entities/user.entity';
import { Slot } from '../slots/entities/slot.entity';
import { ParkingLocationsController } from './parking-locations.controller';
import { ParkingLocationsService } from './parking-locations.service';

@Module({
  imports: [TypeOrmModule.forFeature([ParkingLocation, User, Slot])],
  controllers: [ParkingLocationsController],
  providers: [ParkingLocationsService],
})
export class ParkingLocationsModule {}
