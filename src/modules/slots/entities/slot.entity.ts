import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Floor } from '../../floors/entities/floor.entity';
import { Booking } from '../../bookings/entities/booking.entity';

export enum SlotType {
  NORMAL = 'NORMAL',
  VIP = 'VIP',
  EV = 'EV',
  DISABLED = 'DISABLED',
}

export enum SlotStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
}

@Entity('slots')
export class Slot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Floor, (floor) => floor.slots)
  @JoinColumn({ name: 'floor_id' })
  floor: Floor;

  @Column({ name: 'floor_id' })
  floorId: string;

  @Column({ name: 'slot_code' })
  slotCode: string;

  @Column({ type: 'enum', enum: SlotType, default: SlotType.NORMAL, name: 'slot_type' })
  slotType: SlotType;

  @Column({ type: 'enum', enum: SlotStatus, default: SlotStatus.AVAILABLE })
  status: SlotStatus;

  @OneToMany(() => Booking, (booking) => booking.slot)
  bookings: Booking[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
