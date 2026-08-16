import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Slot } from '../../slots/entities/slot.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum BookingStatus {
  PENDING = 'PENDING',
  RESERVED = 'RESERVED',
  CHECKED_IN = 'CHECKED_IN',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.bookings)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ name: 'vehicle_id' })
  vehicleId: string;

  @ManyToOne(() => Slot, (slot) => slot.bookings)
  @JoinColumn({ name: 'slot_id' })
  slot: Slot;

  @Column({ name: 'slot_id' })
  slotId: string;

  @Column({ name: 'start_time' })
  startTime: Date;

  @Column({ nullable: true, name: 'expected_end_time' })
  expectedEndTime: Date;

  @Column({ nullable: true, name: 'actual_checkin_time' })
  actualCheckinTime: Date;

  @Column({ nullable: true, name: 'actual_checkout_time' })
  actualCheckoutTime: Date;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @OneToOne(() => Payment, (payment) => payment.booking)
  payment: Payment;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
