import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Floor } from '../../floors/entities/floor.entity';
import { ParkingPricing } from '../../pricing/entities/parking-pricing.entity';

export enum ParkingLocationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('parking_locations')
export class ParkingLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column('decimal', { precision: 10, scale: 7 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 7 })
  longitude: number;

  @ManyToOne(() => User, (user) => user.managedLocations, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @Column({ name: 'manager_id', nullable: true })
  managerId: string;

  @Column({
    type: 'enum',
    enum: ParkingLocationStatus,
    default: ParkingLocationStatus.ACTIVE,
  })
  status: ParkingLocationStatus;

  @OneToMany(() => Floor, (floor) => floor.parkingLocation)
  floors: Floor[];

  @OneToOne(() => ParkingPricing, (pricing) => pricing.parkingLocation)
  pricing: ParkingPricing;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
