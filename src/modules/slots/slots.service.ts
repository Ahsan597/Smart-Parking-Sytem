import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slot } from './entities/slot.entity';
import { Floor } from '../floors/entities/floor.entity';
import { assertManagesLocation } from '../parking-locations/parking-locations.util';
import { User } from '../users/entities/user.entity';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { UpdateSlotStatusDto } from './dto/update-slot-status.dto';

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot) private slotsRepository: Repository<Slot>,
    @InjectRepository(Floor) private floorsRepository: Repository<Floor>,
  ) {}

  async create(floorId: string, dto: CreateSlotDto, user: User): Promise<Slot> {
    const floor = await this.getFloorWithLocation(floorId);
    assertManagesLocation(user, floor.parkingLocation);

    const slot = this.slotsRepository.create({ ...dto, floorId });
    return this.slotsRepository.save(slot);
  }

  findAllForFloor(floorId: string): Promise<Slot[]> {
    return this.slotsRepository.find({ where: { floorId } });
  }

  async findOne(id: string): Promise<Slot> {
    const slot = await this.slotsRepository.findOne({ where: { id } });
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }
    return slot;
  }

  async update(id: string, dto: UpdateSlotDto, user: User): Promise<Slot> {
    const slot = await this.getSlotWithLocation(id);
    assertManagesLocation(user, slot.floor.parkingLocation);
    Object.assign(slot, dto);
    return this.slotsRepository.save(slot);
  }

  async updateStatus(id: string, dto: UpdateSlotStatusDto, user: User): Promise<Slot> {
    const slot = await this.getSlotWithLocation(id);
    assertManagesLocation(user, slot.floor.parkingLocation);
    slot.status = dto.status;
    return this.slotsRepository.save(slot);
  }

  async remove(id: string, user: User): Promise<void> {
    const slot = await this.getSlotWithLocation(id);
    assertManagesLocation(user, slot.floor.parkingLocation);
    await this.slotsRepository.remove(slot);
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

  private async getSlotWithLocation(id: string): Promise<Slot> {
    const slot = await this.slotsRepository.findOne({
      where: { id },
      relations: ['floor', 'floor.parkingLocation'],
    });
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }
    return slot;
  }
}
