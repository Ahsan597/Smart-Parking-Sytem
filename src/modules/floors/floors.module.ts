import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Floor } from './entities/floor.entity';
import { ParkingLocation } from '../parking-locations/entities/parking-location.entity';
import { FloorsController } from './floors.controller';
import { FloorsService } from './floors.service';

@Module({
  imports: [TypeOrmModule.forFeature([Floor, ParkingLocation])],
  controllers: [FloorsController],
  providers: [FloorsService],
})
export class FloorsModule {}
