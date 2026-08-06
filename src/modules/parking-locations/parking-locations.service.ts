import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParkingLocation, ParkingLocationStatus } from './entities/parking-location.entity';
import { Slot, SlotStatus } from '../slots/entities/slot.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateParkingLocationDto } from './dto/create-parking-location.dto';
import { UpdateParkingLocationDto } from './dto/update-parking-location.dto';
import { SearchParkingLocationsDto } from './dto/search-parking-locations.dto';

@Injectable()
export class ParkingLocationsService {
  constructor(
    @InjectRepository(ParkingLocation) private locationsRepository: Repository<ParkingLocation>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Slot) private slotsRepository: Repository<Slot>,
  ) {}

  async create(dto: CreateParkingLocationDto): Promise<ParkingLocation> {
    if (dto.managerId) {
      await this.assertValidManager(dto.managerId);
    }
    const location = this.locationsRepository.create(dto);
    return this.locationsRepository.save(location);
  }

  async search(filters: SearchParkingLocationsDto = {}): Promise<(ParkingLocation & { availableSlots: number })[]> {
    const qb = this.locationsRepository
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.pricing', 'pricing')
      .where('location.status = :status', { status: ParkingLocationStatus.ACTIVE });

    if (filters.city) {
      qb.andWhere('location.city ILIKE :city', { city: `%${filters.city}%` });
    }
    if (filters.name) {
      qb.andWhere('location.name ILIKE :name', { name: `%${filters.name}%` });
    }

    const locations = await qb.getMany();

    const withAvailability = await Promise.all(
      locations.map(async (location) => {
        const availableSlots = await this.slotsRepository.count({
          where: { floor: { parkingLocationId: location.id }, status: SlotStatus.AVAILABLE },
        });
        return { ...location, availableSlots };
      }),
    );

    if (filters.onlyAvailable === 'true') {
      return withAvailability.filter((location) => location.availableSlots > 0);
    }
    return withAvailability;
  }

  async findAvailableSlots(locationId: string): Promise<Slot[]> {
    await this.findOneBare(locationId);
    return this.slotsRepository.find({
      where: { floor: { parkingLocationId: locationId }, status: SlotStatus.AVAILABLE },
      relations: ['floor'],
    });
  }

  findMine(managerId: string): Promise<ParkingLocation[]> {
    return this.locationsRepository.find({ where: { managerId } });
  }

  async findOne(id: string): Promise<ParkingLocation> {
    const location = await this.locationsRepository.findOne({
      where: { id },
      relations: ['floors', 'floors.slots', 'manager'],
    });
    if (!location) {
      throw new NotFoundException('Parking location not found');
    }
    return location;
  }

  async findOneBare(id: string): Promise<ParkingLocation> {
    const location = await this.locationsRepository.findOne({ where: { id } });
    if (!location) {
      throw new NotFoundException('Parking location not found');
    }
    return location;
  }

  async update(id: string, dto: UpdateParkingLocationDto): Promise<ParkingLocation> {
    const location = await this.findOneBare(id);
    if (dto.managerId) {
      await this.assertValidManager(dto.managerId);
    }
    Object.assign(location, dto);
    return this.locationsRepository.save(location);
  }

  async remove(id: string): Promise<void> {
    const location = await this.findOneBare(id);
    await this.locationsRepository.remove(location);
  }

  private async assertValidManager(managerId: string): Promise<void> {
    const manager = await this.usersRepository.findOne({ where: { id: managerId } });
    if (!manager) {
      throw new BadRequestException('Manager not found');
    }
    if (manager.role !== UserRole.PARKING_MANAGER) {
      throw new BadRequestException('Assigned manager must have the PARKING_MANAGER role');
    }
  }
}
