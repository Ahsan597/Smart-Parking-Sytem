import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingLocation } from './entities/parking-location.entity';
import { User } from '../users/entities/user.entity';
import { ParkingLocationsController } from './parking-locations.controller';
import { ParkingLocationsService } from './parking-locations.service';

@Module({
  imports: [TypeOrmModule.forFeature([ParkingLocation, User])],
  controllers: [ParkingLocationsController],
  providers: [ParkingLocationsService],
})
export class ParkingLocationsModule {}
