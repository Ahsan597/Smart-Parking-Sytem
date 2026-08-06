import { IsNumber, IsOptional, Min } from 'class-validator';

export class SetPricingDto {
  @IsNumber()
  @Min(0)
  hourlyRate: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyRate?: number;
}
