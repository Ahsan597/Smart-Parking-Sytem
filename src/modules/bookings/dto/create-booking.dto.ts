import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  slotId: string;

  @IsUUID()
  vehicleId: string;

  @IsInt()
  @Min(15)
  @Max(1440)
  expectedDurationMinutes: number;
}
