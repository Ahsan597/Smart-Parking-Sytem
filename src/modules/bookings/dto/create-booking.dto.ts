import { IsISO8601, IsOptional, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  slotId: string;

  @IsUUID()
  vehicleId: string;

  @IsISO8601()
  checkInTime: string;

  @IsOptional()
  @IsISO8601()
  checkOutTime?: string;
}
