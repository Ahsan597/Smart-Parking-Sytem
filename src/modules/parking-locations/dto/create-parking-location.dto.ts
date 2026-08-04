import { IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateParkingLocationDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @IsUUID()
  managerId?: string;
}
