import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Slot, SlotStatus } from '../slots/entities/slot.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Payment, PaymentMethod, PaymentStatus } from '../payments/entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CheckoutDto } from './dto/checkout.dto';
import {
  BOOKING_CANCELLED_EVENT,
  BOOKING_CHECKED_OUT_EVENT,
  BOOKING_RESERVED_EVENT,
  BookingLifecycleEvent,
  SLOT_UPDATED_EVENT,
  SlotUpdatedEvent,
} from '../realtime/events';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking) private bookingsRepository: Repository<Booking>,
    @InjectRepository(Slot) private slotsRepository: Repository<Slot>,
    @InjectRepository(Vehicle) private vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(Payment) private paymentsRepository: Repository<Payment>,
    @InjectDataSource() private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(user: User, dto: CreateBookingDto): Promise<Booking> {
    const vehicle = await this.vehiclesRepository.findOne({ where: { id: dto.vehicleId } });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    if (vehicle.userId !== user.id) {
      throw new ForbiddenException('You do not own this vehicle');
    }

    const existingActive = await this.bookingsRepository.findOne({
      where: [
        { vehicleId: dto.vehicleId, status: BookingStatus.RESERVED },
        { vehicleId: dto.vehicleId, status: BookingStatus.CHECKED_IN },
      ],
    });
    if (existingActive) {
      throw new ConflictException('This vehicle already has an active booking');
    }

    const booking = await this.dataSource.transaction(async (manager) => {
      const slotRepo = manager.getRepository(Slot);
      const slot = await slotRepo.findOne({
        where: { id: dto.slotId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!slot) {
        throw new NotFoundException('Slot not found');
      }
      if (slot.status !== SlotStatus.AVAILABLE) {
        throw new ConflictException('Slot is not available');
      }

      slot.status = SlotStatus.RESERVED;
      await slotRepo.save(slot);

      const startTime = new Date();
      const expectedEndTime = new Date(startTime.getTime() + dto.expectedDurationMinutes * 60000);

      const newBooking = manager.getRepository(Booking).create({
        userId: user.id,
        vehicleId: dto.vehicleId,
        slotId: dto.slotId,
        startTime,
        expectedEndTime,
        status: BookingStatus.RESERVED,
      });
      return manager.getRepository(Booking).save(newBooking);
    });

    const slot = await this.emitSlotUpdated(dto.slotId, SlotStatus.AVAILABLE, SlotStatus.RESERVED);
    if (slot) {
      this.eventEmitter.emit(BOOKING_RESERVED_EVENT, {
        userId: user.id,
        bookingId: booking.id,
        slotCode: slot.slotCode,
        locationName: slot.floor.parkingLocation.name,
      } as BookingLifecycleEvent);
    }

    return booking;
  }

  async cancel(user: User, id: string): Promise<Booking> {
    const booking = await this.getOwnedBooking(user, id);
    if (booking.status !== BookingStatus.RESERVED) {
      throw new ConflictException('Only reserved bookings can be cancelled');
    }

    booking.status = BookingStatus.CANCELLED;
    await this.bookingsRepository.save(booking);
    await this.slotsRepository.update(booking.slotId, { status: SlotStatus.AVAILABLE });

    const slot = await this.emitSlotUpdated(booking.slotId, SlotStatus.RESERVED, SlotStatus.AVAILABLE);
    if (slot) {
      this.eventEmitter.emit(BOOKING_CANCELLED_EVENT, {
        userId: user.id,
        bookingId: booking.id,
        slotCode: slot.slotCode,
        locationName: slot.floor.parkingLocation.name,
      } as BookingLifecycleEvent);
    }

    return booking;
  }

  async checkIn(user: User, id: string): Promise<Booking> {
    const booking = await this.getOwnedBooking(user, id);
    if (booking.status !== BookingStatus.RESERVED) {
      throw new ConflictException('Only reserved bookings can be checked in');
    }

    booking.status = BookingStatus.CHECKED_IN;
    booking.actualCheckinTime = new Date();
    await this.bookingsRepository.save(booking);
    await this.slotsRepository.update(booking.slotId, { status: SlotStatus.OCCUPIED });

    await this.emitSlotUpdated(booking.slotId, SlotStatus.RESERVED, SlotStatus.OCCUPIED);

    return booking;
  }

  async checkOut(user: User, id: string, dto: CheckoutDto): Promise<Booking> {
    const booking = await this.getOwnedBooking(user, id);
    if (booking.status !== BookingStatus.CHECKED_IN) {
      throw new ConflictException('Only checked-in bookings can be checked out');
    }

    const slot = await this.slotsRepository.findOne({
      where: { id: booking.slotId },
      relations: ['floor', 'floor.parkingLocation', 'floor.parkingLocation.pricing'],
    });
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }
    const pricing = slot.floor.parkingLocation.pricing;
    if (!pricing) {
      throw new BadRequestException('Pricing is not configured for this parking location yet');
    }

    const checkoutTime = new Date();
    booking.actualCheckoutTime = checkoutTime;
    booking.status = BookingStatus.COMPLETED;
    await this.bookingsRepository.save(booking);
    await this.slotsRepository.update(booking.slotId, { status: SlotStatus.AVAILABLE });

    const durationMs = checkoutTime.getTime() - booking.actualCheckinTime.getTime();
    const durationHours = Math.max(1, Math.ceil(durationMs / (60 * 60 * 1000)));
    const amount = durationHours * Number(pricing.hourlyRate);

    const payment = this.paymentsRepository.create({
      bookingId: booking.id,
      amount,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: dto.paymentMethod ?? PaymentMethod.CASH,
      paidAt: checkoutTime,
    });
    await this.paymentsRepository.save(payment);

    booking.payment = payment;

    const updatedSlot = await this.emitSlotUpdated(booking.slotId, SlotStatus.OCCUPIED, SlotStatus.AVAILABLE);
    if (updatedSlot) {
      this.eventEmitter.emit(BOOKING_CHECKED_OUT_EVENT, {
        userId: user.id,
        bookingId: booking.id,
        slotCode: updatedSlot.slotCode,
        locationName: updatedSlot.floor.parkingLocation.name,
        amount: Number(payment.amount),
      } as BookingLifecycleEvent);
    }

    return booking;
  }

  findAllForUser(userId: string, status?: BookingStatus): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: status ? { userId, status } : { userId },
      relations: ['slot', 'slot.floor', 'slot.floor.parkingLocation', 'vehicle', 'payment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForUser(user: User, id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['slot', 'slot.floor', 'slot.floor.parkingLocation', 'vehicle', 'payment'],
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.userId !== user.id) {
      throw new ForbiddenException('This booking does not belong to you');
    }
    return booking;
  }

  private async getOwnedBooking(user: User, id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.userId !== user.id) {
      throw new ForbiddenException('This booking does not belong to you');
    }
    return booking;
  }

  private async emitSlotUpdated(
    slotId: string,
    previousStatus: SlotStatus,
    newStatus: SlotStatus,
  ): Promise<Slot | null> {
    const slot = await this.slotsRepository.findOne({
      where: { id: slotId },
      relations: ['floor', 'floor.parkingLocation'],
    });
    if (!slot) {
      return null;
    }

    this.eventEmitter.emit(SLOT_UPDATED_EVENT, {
      slotId: slot.id,
      slotCode: slot.slotCode,
      floorId: slot.floor.id,
      parkingLocationId: slot.floor.parkingLocation.id,
      locationName: slot.floor.parkingLocation.name,
      previousStatus,
      status: newStatus,
    } as SlotUpdatedEvent);

    return slot;
  }
}
