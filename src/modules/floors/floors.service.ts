import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Floor } from './entities/floor.entity';
import { ParkingLocation } from '../parking-locations/entities/parking-location.entity';
import { assertManagesLocation } from '../parking-locations/parking-locations.util';
import { User } from '../users/entities/user.entity';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';

@Injectable()
export class FloorsService {
  constructor(
    @InjectRepository(Floor) private floorsRepository: Repository<Floor>,
    @InjectRepository(ParkingLocation) private locationsRepository: Repository<ParkingLocation>,
  ) {}

  async create(locationId: string, dto: CreateFloorDto, user: User): Promise<Floor> {
    const location = await this.getLocationOrFail(locationId);
    assertManagesLocation(user, location);

    const floor = this.floorsRepository.create({ ...dto, parkingLocationId: locationId });
    return this.floorsRepository.save(floor);
  }

  findAllForLocation(locationId: string): Promise<Floor[]> {
    return this.floorsRepository.find({ where: { parkingLocationId: locationId } });
  }

  async findOne(id: string): Promise<Floor> {
    const floor = await this.floorsRepository.findOne({ where: { id }, relations: ['slots'] });
    if (!floor) {
      throw new NotFoundException('Floor not found');
    }
    return floor;
  }

  async update(id: string, dto: UpdateFloorDto, user: User): Promise<Floor> {
    const floor = await this.getFloorWithLocation(id);
    assertManagesLocation(user, floor.parkingLocation);
    Object.assign(floor, dto);
    return this.floorsRepository.save(floor);
  }

  async remove(id: string, user: User): Promise<void> {
    const floor = await this.getFloorWithLocation(id);
    assertManagesLocation(user, floor.parkingLocation);
    await this.floorsRepository.remove(floor);
  }

  private async getLocationOrFail(id: string): Promise<ParkingLocation> {
    const location = await this.locationsRepository.findOne({ where: { id } });
    if (!location) {
      throw new NotFoundException('Parking location not found');
    }
    return location;
  }

  private async getFloorWithLocation(id: string): Promise<Floor> {
    const floor = await this.floorsRepository.findOne({
      where: { id },
      relations: ['parkingLocation'],
    });
    if (!floor) {
      throw new NotFoundException('Floor not found');
    }
    return floor;
  }
}
