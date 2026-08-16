import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(@InjectRepository(Payment) private paymentsRepository: Repository<Payment>) {}

  findAllForUser(userId: string): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { booking: { userId } },
      relations: ['booking', 'booking.slot', 'booking.slot.floor', 'booking.slot.floor.parkingLocation'],
      order: { createdAt: 'DESC' },
    });
  }
}
