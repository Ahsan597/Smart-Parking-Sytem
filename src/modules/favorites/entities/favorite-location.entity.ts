import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ParkingLocation } from '../../parking-locations/entities/parking-location.entity';

@Entity('favorite_locations')
@Unique(['userId', 'parkingLocationId'])
export class FavoriteLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => ParkingLocation)
  @JoinColumn({ name: 'parking_location_id' })
  parkingLocation: ParkingLocation;

  @Column({ name: 'parking_location_id' })
  parkingLocationId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
