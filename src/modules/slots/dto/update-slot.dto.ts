import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SlotType } from '../entities/slot.entity';

export class UpdateSlotDto {
  @IsOptional()
  @IsString()
  slotCode?: string;

  @IsOptional()
  @IsEnum(SlotType)
  slotType?: SlotType;
}
