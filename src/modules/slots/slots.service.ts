import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Slot } from './entities/slot.entity';
import { Floor } from '../floors/entities/floor.entity';
import { assertManagesLocation } from '../parking-locations/parking-locations.util';
import { User } from '../users/entities/user.entity';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { UpdateSlotStatusDto } from './dto/update-slot-status.dto';
import { SLOT_UPDATED_EVENT, SlotUpdatedEvent } from '../realtime/events';

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot) private slotsRepository: Repository<Slot>,
    @InjectRepository(Floor) private floorsRepository: Repository<Floor>,
    private eventEmitter: EventEmitter2,
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

    const previousStatus = slot.status;
    slot.status = dto.status;
    const saved = await this.slotsRepository.save(slot);

    this.eventEmitter.emit(SLOT_UPDATED_EVENT, {
      slotId: saved.id,
      slotCode: saved.slotCode,
      floorId: slot.floor.id,
      parkingLocationId: slot.floor.parkingLocation.id,
      locationName: slot.floor.parkingLocation.name,
      previousStatus,
      status: saved.status,
    } as SlotUpdatedEvent);

    return saved;
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
