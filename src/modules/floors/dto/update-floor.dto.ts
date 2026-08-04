import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateFloorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  floorNumber?: number;
}
