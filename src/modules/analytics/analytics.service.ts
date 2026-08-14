import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Slot, SlotStatus } from '../slots/entities/slot.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { ParkingLocation } from '../parking-locations/entities/parking-location.entity';
import { assertManagesLocation } from '../parking-locations/parking-locations.util';
import { User, UserRole } from '../users/entities/user.entity';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Payment) private paymentsRepository: Repository<Payment>,
    @InjectRepository(Slot) private slotsRepository: Repository<Slot>,
    @InjectRepository(Booking) private bookingsRepository: Repository<Booking>,
    @InjectRepository(ParkingLocation) private locationsRepository: Repository<ParkingLocation>,
  ) {}

  async getRevenue(user: User, query: AnalyticsQueryDto) {
    const locationIds = await this.resolveLocationIds(user, query.locationId);
    if (locationIds.length === 0) {
      return { totalRevenue: 0, paymentsCount: 0 };
    }

    const qb = this.paymentsRepository
      .createQueryBuilder('payment')
      .innerJoin('payment.booking', 'booking')
      .innerJoin('booking.slot', 'slot')
      .innerJoin('slot.floor', 'floor')
      .where('floor.parkingLocationId IN (:...locationIds)', { locationIds })
      .andWhere('payment.paymentStatus = :status', { status: PaymentStatus.PAID });

    if (query.from) {
      qb.andWhere('payment.paidAt >= :from', { from: new Date(query.from) });
    }
    if (query.to) {
      qb.andWhere('payment.paidAt <= :to', { to: new Date(query.to) });
    }

    const raw = await qb
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .addSelect('COUNT(payment.id)', 'count')
      .getRawOne();

    return { totalRevenue: Number(raw.total), paymentsCount: Number(raw.count) };
  }

  async getOccupancy(user: User, query: AnalyticsQueryDto) {
    const locationIds = await this.resolveLocationIds(user, query.locationId);
    const results = [];

    for (const id of locationIds) {
      const location = await this.locationsRepository.findOne({ where: { id } });
      const slots = await this.slotsRepository.find({ where: { floor: { parkingLocationId: id } } });
      const total = slots.length;
      const available = slots.filter((s) => s.status === SlotStatus.AVAILABLE).length;
      const reserved = slots.filter((s) => s.status === SlotStatus.RESERVED).length;
      const occupied = slots.filter((s) => s.status === SlotStatus.OCCUPIED).length;
      const maintenance = slots.filter((s) => s.status === SlotStatus.MAINTENANCE).length;

      results.push({
        locationId: id,
        locationName: location?.name,
        totalSlots: total,
        available,
        reserved,
        occupied,
        maintenance,
        occupancyRate: total > 0 ? Number(((occupied / total) * 100).toFixed(1)) : 0,
      });
    }

    return query.locationId ? (results[0] ?? null) : results;
  }

  async getPeakHours(user: User, query: AnalyticsQueryDto) {
    const locationIds = await this.resolveLocationIds(user, query.locationId);
    if (locationIds.length === 0) {
      return [];
    }

    const qb = this.bookingsRepository
      .createQueryBuilder('booking')
      .innerJoin('booking.slot', 'slot')
      .innerJoin('slot.floor', 'floor')
      .where('floor.parkingLocationId IN (:...locationIds)', { locationIds })
      .andWhere('booking.actualCheckinTime IS NOT NULL');

    if (query.from) {
      qb.andWhere('booking.actualCheckinTime >= :from', { from: new Date(query.from) });
    }
    if (query.to) {
      qb.andWhere('booking.actualCheckinTime <= :to', { to: new Date(query.to) });
    }

    const raw = await qb
      .select('EXTRACT(HOUR FROM booking.actualCheckinTime)', 'hour')
      .addSelect('COUNT(booking.id)', 'count')
      .groupBy('hour')
      .orderBy('hour', 'ASC')
      .getRawMany();

    return raw.map((r) => ({ hour: Number(r.hour), count: Number(r.count) }));
  }

  private async resolveLocationIds(user: User, locationId?: string): Promise<string[]> {
    if (locationId) {
      const location = await this.locationsRepository.findOne({ where: { id: locationId } });
      if (!location) {
        throw new NotFoundException('Parking location not found');
      }
      assertManagesLocation(user, location);
      return [locationId];
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      const all = await this.locationsRepository.find({ select: ['id'] });
      return all.map((l) => l.id);
    }

    const mine = await this.locationsRepository.find({ where: { managerId: user.id }, select: ['id'] });
    return mine.map((l) => l.id);
  }
}
