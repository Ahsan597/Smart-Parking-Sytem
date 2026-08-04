import { IsEnum } from 'class-validator';
import { SlotStatus } from '../entities/slot.entity';

export class UpdateSlotStatusDto {
  @IsEnum(SlotStatus)
  status: SlotStatus;
}
