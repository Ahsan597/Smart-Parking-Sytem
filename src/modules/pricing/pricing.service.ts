import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParkingPricing } from './entities/parking-pricing.entity';
import { ParkingLocation } from '../parking-locations/entities/parking-location.entity';
import { assertManagesLocation } from '../parking-locations/parking-locations.util';
import { User } from '../users/entities/user.entity';
import { SetPricingDto } from './dto/set-pricing.dto';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(ParkingPricing) private pricingRepository: Repository<ParkingPricing>,
    @InjectRepository(ParkingLocation) private locationsRepository: Repository<ParkingLocation>,
  ) {}

  async setPricing(locationId: string, dto: SetPricingDto, user: User): Promise<ParkingPricing> {
    const location = await this.locationsRepository.findOne({ where: { id: locationId } });
    if (!location) {
      throw new NotFoundException('Parking location not found');
    }
    assertManagesLocation(user, location);

    let pricing = await this.pricingRepository.findOne({ where: { parkingLocationId: locationId } });
    if (pricing) {
      Object.assign(pricing, dto);
    } else {
      pricing = this.pricingRepository.create({ ...dto, parkingLocationId: locationId });
    }
    return this.pricingRepository.save(pricing);
  }

  async getPricing(locationId: string): Promise<ParkingPricing> {
    const pricing = await this.pricingRepository.findOne({ where: { parkingLocationId: locationId } });
    if (!pricing) {
      throw new NotFoundException('Pricing not configured for this parking location yet');
    }
    return pricing;
  }
}
