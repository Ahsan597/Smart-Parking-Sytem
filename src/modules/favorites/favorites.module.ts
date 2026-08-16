import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteLocation } from './entities/favorite-location.entity';
import { ParkingLocation } from '../parking-locations/entities/parking-location.entity';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

@Module({
  imports: [TypeOrmModule.forFeature([FavoriteLocation, ParkingLocation])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
