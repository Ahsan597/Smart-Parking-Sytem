import { IsInt, IsString } from 'class-validator';

export class CreateFloorDto {
  @IsString()
  name: string;

  @IsInt()
  floorNumber: number;
}
