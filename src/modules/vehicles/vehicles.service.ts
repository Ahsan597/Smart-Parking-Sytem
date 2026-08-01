import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(@InjectRepository(Vehicle) private vehiclesRepository: Repository<Vehicle>) {}

  create(userId: string, dto: CreateVehicleDto): Promise<Vehicle> {
    const vehicle = this.vehiclesRepository.create({ ...dto, userId });
    return this.vehiclesRepository.save(vehicle);
  }

  findAllForUser(userId: string): Promise<Vehicle[]> {
    return this.vehiclesRepository.find({ where: { userId } });
  }

  async findOneForUser(userId: string, id: string): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findOne({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    if (vehicle.userId !== userId) {
      throw new ForbiddenException('You do not own this vehicle');
    }
    return vehicle;
  }

  async update(userId: string, id: string, dto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findOneForUser(userId, id);
    Object.assign(vehicle, dto);
    return this.vehiclesRepository.save(vehicle);
  }

  async remove(userId: string, id: string): Promise<void> {
    const vehicle = await this.findOneForUser(userId, id);
    await this.vehiclesRepository.remove(vehicle);
  }
}
