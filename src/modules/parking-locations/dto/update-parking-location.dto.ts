import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ParkingLocationStatus } from '../entities/parking-location.entity';

export class UpdateParkingLocationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsUUID()
  managerId?: string;

  @IsOptional()
  @IsEnum(ParkingLocationStatus)
  status?: ParkingLocationStatus;
}
