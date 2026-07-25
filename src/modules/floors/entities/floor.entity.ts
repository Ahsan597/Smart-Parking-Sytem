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
import { ParkingLocation } from '../../parking-locations/entities/parking-location.entity';
import { Slot } from '../../slots/entities/slot.entity';

@Entity('floors')
export class Floor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ParkingLocation, (location) => location.floors)
  @JoinColumn({ name: 'parking_location_id' })
  parkingLocation: ParkingLocation;

  @Column({ name: 'parking_location_id' })
  parkingLocationId: string;

  @Column()
  name: string;

  @Column({ name: 'floor_number' })
  floorNumber: number;

  @OneToMany(() => Slot, (slot) => slot.floor)
  slots: Slot[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
