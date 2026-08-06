import { IsIn, IsOptional, IsString } from 'class-validator';

export class SearchParkingLocationsDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  onlyAvailable?: string;
}
