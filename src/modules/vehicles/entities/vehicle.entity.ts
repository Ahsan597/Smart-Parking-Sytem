import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn 
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum VehicleType {
  CAR = 'CAR',
  BIKE = 'BIKE',
  SUV = 'SUV',
  TRUCK = 'TRUCK',
  VAN = 'VAN',
  EV = 'EV',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.vehicles)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'vehicle_number' })
  vehicleNumber: string;

  @Column({ 
    type: 'enum', 
    enum: VehicleType,
    default: VehicleType.CAR 
  })
  vehicleType: VehicleType;

  @Column({ nullable: true, name: 'vehicle_brand' })
  vehicleBrand: string;

  @Column({ nullable: true, name: 'vehicle_model' })
  vehicleModel: string;

  @Column({ nullable: true, name: 'vehicle_color' })
  vehicleColor: string;

  @Column({ default: false, name: 'is_default' })
  isDefault: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}