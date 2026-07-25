import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';

export enum PaymentMethod {
  CASH = 'CASH',
  JAZZCASH = 'JAZZCASH',
  EASYPAISA = 'EASYPAISA',
  STRIPE = 'STRIPE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Booking, (booking) => booking.payment)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'booking_id', unique: true })
  bookingId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
    name: 'payment_status',
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'enum', enum: PaymentMethod, name: 'payment_method' })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true, name: 'paid_at' })
  paidAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
