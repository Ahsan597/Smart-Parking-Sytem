import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Notification } from './entities/notification.entity';
import { FavoriteLocation } from '../favorites/entities/favorite-location.entity';
import { SlotStatus } from '../slots/entities/slot.entity';
import {
  BOOKING_CANCELLED_EVENT,
  BOOKING_CHECKED_OUT_EVENT,
  BOOKING_EXPIRED_EVENT,
  BOOKING_RESERVED_EVENT,
  BookingLifecycleEvent,
  NOTIFICATION_CREATED_EVENT,
  SLOT_UPDATED_EVENT,
  SlotUpdatedEvent,
} from '../realtime/events';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notificationsRepository: Repository<Notification>,
    @InjectRepository(FavoriteLocation) private favoritesRepository: Repository<FavoriteLocation>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, title: string, message: string): Promise<Notification> {
    const notification = this.notificationsRepository.create({ userId, title, message });
    const saved = await this.notificationsRepository.save(notification);
    this.eventEmitter.emit(NOTIFICATION_CREATED_EVENT, { userId, notification: saved });
    return saved;
  }

  findAllForUser(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markRead(userId: string, id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('This notification does not belong to you');
    }
    notification.isRead = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notificationsRepository.update({ userId, isRead: false }, { isRead: true });
  }

  @OnEvent(BOOKING_RESERVED_EVENT)
  async handleBookingReserved(payload: BookingLifecycleEvent): Promise<void> {
    await this.create(
      payload.userId,
      'Booking Confirmed',
      `Your reservation for slot ${payload.slotCode} at ${payload.locationName} is confirmed.`,
    );
  }

  @OnEvent(BOOKING_CANCELLED_EVENT)
  async handleBookingCancelled(payload: BookingLifecycleEvent): Promise<void> {
    await this.create(
      payload.userId,
      'Booking Cancelled',
      `Your reservation for slot ${payload.slotCode} at ${payload.locationName} was cancelled.`,
    );
  }

  @OnEvent(BOOKING_CHECKED_OUT_EVENT)
  async handleBookingCheckedOut(payload: BookingLifecycleEvent): Promise<void> {
    await this.create(
      payload.userId,
      'Checked Out',
      `You checked out of slot ${payload.slotCode} at ${payload.locationName}. Amount charged: ${payload.amount}.`,
    );
  }

  @OnEvent(BOOKING_EXPIRED_EVENT)
  async handleBookingExpired(payload: BookingLifecycleEvent): Promise<void> {
    await this.create(
      payload.userId,
      'Reservation Expired',
      `Your reservation for slot ${payload.slotCode} at ${payload.locationName} expired because you didn't check in.`,
    );
  }

  @OnEvent(SLOT_UPDATED_EVENT)
  async handleSlotFreedAtFavorite(payload: SlotUpdatedEvent): Promise<void> {
    const justFreed =
      payload.previousStatus !== SlotStatus.AVAILABLE && payload.status === SlotStatus.AVAILABLE;
    if (!justFreed) {
      return;
    }
    const favorites = await this.favoritesRepository.find({
      where: { parkingLocationId: payload.parkingLocationId },
    });
    for (const favorite of favorites) {
      await this.create(
        favorite.userId,
        'Slot Available',
        `A slot just opened up at ${payload.locationName} (${payload.slotCode}).`,
      );
    }
  }
}
