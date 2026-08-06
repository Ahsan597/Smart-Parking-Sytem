import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Slot, SlotStatus } from '../slots/entities/slot.entity';

@Injectable()
export class BookingsExpiryService {
  private readonly logger = new Logger(BookingsExpiryService.name);

  constructor(
    @InjectRepository(Booking) private bookingsRepository: Repository<Booking>,
    @InjectRepository(Slot) private slotsRepository: Repository<Slot>,
    private configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async expireStaleReservations(): Promise<void> {
    const graceMinutes = Number(this.configService.get('RESERVATION_GRACE_MINUTES') ?? 15);
    const cutoff = new Date(Date.now() - graceMinutes * 60000);

    const staleBookings = await this.bookingsRepository.find({
      where: { status: BookingStatus.RESERVED, createdAt: LessThan(cutoff) },
    });

    for (const booking of staleBookings) {
      booking.status = BookingStatus.EXPIRED;
      await this.bookingsRepository.save(booking);
      await this.slotsRepository.update(booking.slotId, { status: SlotStatus.AVAILABLE });
      this.logger.log(`Booking ${booking.id} expired (no check-in within grace period)`);
    }
  }
}
