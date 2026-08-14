import { SlotStatus } from '../slots/entities/slot.entity';

export const SLOT_UPDATED_EVENT = 'slot.updated';
export const NOTIFICATION_CREATED_EVENT = 'notification.created';
export const BOOKING_RESERVED_EVENT = 'booking.reserved';
export const BOOKING_CANCELLED_EVENT = 'booking.cancelled';
export const BOOKING_CHECKED_OUT_EVENT = 'booking.checkedOut';
export const BOOKING_EXPIRED_EVENT = 'booking.expired';

export interface SlotUpdatedEvent {
  slotId: string;
  slotCode: string;
  floorId: string;
  parkingLocationId: string;
  locationName: string;
  previousStatus: SlotStatus;
  status: SlotStatus;
}

export interface BookingLifecycleEvent {
  userId: string;
  bookingId: string;
  slotCode: string;
  locationName: string;
  amount?: number;
}
