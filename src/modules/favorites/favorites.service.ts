import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteLocation } from './entities/favorite-location.entity';
import { ParkingLocation } from '../parking-locations/entities/parking-location.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoriteLocation) private favoritesRepository: Repository<FavoriteLocation>,
    @InjectRepository(ParkingLocation) private locationsRepository: Repository<ParkingLocation>,
  ) {}

  async add(userId: string, locationId: string): Promise<FavoriteLocation> {
    const location = await this.locationsRepository.findOne({ where: { id: locationId } });
    if (!location) {
      throw new NotFoundException('Parking location not found');
    }
    const existing = await this.favoritesRepository.findOne({
      where: { userId, parkingLocationId: locationId },
    });
    if (existing) {
      throw new ConflictException('This location is already in your favorites');
    }
    const favorite = this.favoritesRepository.create({ userId, parkingLocationId: locationId });
    return this.favoritesRepository.save(favorite);
  }

  async remove(userId: string, locationId: string): Promise<void> {
    const existing = await this.favoritesRepository.findOne({
      where: { userId, parkingLocationId: locationId },
    });
    if (!existing) {
      throw new NotFoundException('This location is not in your favorites');
    }
    await this.favoritesRepository.remove(existing);
  }

  findAllForUser(userId: string): Promise<FavoriteLocation[]> {
    return this.favoritesRepository.find({
      where: { userId },
      relations: ['parkingLocation', 'parkingLocation.pricing'],
      order: { createdAt: 'DESC' },
    });
  }
}
