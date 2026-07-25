import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ParkingLocation } from '../../parking-locations/entities/parking-location.entity';

@Entity('parking_pricing')
export class ParkingPricing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => ParkingLocation, (location) => location.pricing)
  @JoinColumn({ name: 'parking_location_id' })
  parkingLocation: ParkingLocation;

  @Column({ name: 'parking_location_id', unique: true })
  parkingLocationId: string;

  @Column('decimal', { precision: 10, scale: 2, name: 'hourly_rate' })
  hourlyRate: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, name: 'daily_rate' })
  dailyRate: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, name: 'monthly_rate' })
  monthlyRate: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
